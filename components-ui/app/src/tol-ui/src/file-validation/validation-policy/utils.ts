/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PIPELINE_DS,
  BASE_POLICIES_MAP,
  VALIDATION_ENDPOINTS,
  FILE_VALIDATION_STATUS,
  PopUpMessage,
  downloadReportFile,
  downloadFileFromS3,
  API_METHODS,
  fetchCurrentPipelineResults,
  getErrorWarningCounts,
  VALIDATIONS,
  // BASE_MODES_MAP,
} from "../..";

import type {
  TFileValidationActionId,
  TFileValidationActionMap,
  TFileValidationAction,
  TFileValidationStatus,
  TFileValidationPolicyModule,
  IAllValidationData,
  TValidationContextItem,
  TFileValidationPolicyModuleOverrides,
  TFileValidationStatusPolicyMap,
  TFileValidationStatusPolicy,
  TValidationSubmissionMutations,
  IValidationSubmissionMutation,
} from "../..";

/**
 * Creates a file validation action object that updates the validation status of an upload.
 *
 * This helper constructs a standard action definition (with ID, label, and callback)
 * configured to update the `validation_status` attribute of the current upload item
 * in the database when triggered.
 *
 * @param action - An object containing the identifier and display label for the action.
 * @param status - The target validation status to apply when the action is executed.
 * @returns A complete `TFileValidationAction` object containing the logic to update the status.
 */

export function setValidationStatusAction(
  action: { id: TFileValidationActionId; label: string },
  status: TFileValidationStatus,
): TFileValidationAction {
  return {
    id: action.id,
    label: action.label,
    callback: async ({
      items,
      dataSource,
      setForceTableUpdate,
      setSelectedRows,
    }) => {
      const payload = items.map((item: TValidationContextItem) => ({
        id: item.id,
        type: VALIDATIONS.UPLOAD,
        attributes: { validation_status: status },
      }));

      try {
        const res = await dataSource.upsert({
          objectType: VALIDATION_ENDPOINTS.UPLOAD,
          payload: payload,
        });

        if (!res) {
          PopUpMessage({
            type: "error",
            message: `Could not complete - ${action.label} (not found)`,
          });
          return;
        }

        PopUpMessage({
          type: "success",
          message: `${action.label} successful.`,
        });

        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      } catch (e) {
        console.error(e);
        PopUpMessage({
          type: "error",
          message: `Could not complete - ${action.label}`,
        });
      }
    },
  };
}

export async function mutateSubmission(
  mutations: TValidationSubmissionMutations,
  messages: { success: string; error: string },
  attribute: string,
  setOpen?: (open: boolean) => void,
): Promise<void> {
  const mutatedPayload = mutations.map(
    (mutatedItem: IValidationSubmissionMutation) => {
      return {
        id: mutatedItem.id,
        type: "upload",
        attributes: {
          ...(attribute === "rejection_reason" && {
            validation_status: FILE_VALIDATION_STATUS.FILE_REJECTED,
          }),
          [attribute]: mutatedItem.attributeValue,
        },
      };
    },
  );

  try {
    await PIPELINE_DS.upsert({
      objectType: VALIDATION_ENDPOINTS.UPLOAD,
      payload: mutatedPayload,
    });

    PopUpMessage({
      type: "success",
      message: messages.success,
    });

    setOpen?.(false);
  } catch (e) {
    console.error(e);
    PopUpMessage({
      type: "error",
      message: messages.error,
    });
  }
}

export function viewReportAction(): TFileValidationAction {
  return {
    id: "viewReport",
    label: "View Report(s)",
    callback: ({ setReportOpen }) => {
      setReportOpen?.(true);
    },
  };
}

export function downloadReportAction(): TFileValidationAction {
  return {
    id: "downloadReport",
    label: "Download Report(s)",
    callback: async ({ items, dataSource }) => {
      await Promise.all(
        items.map(async (item: IAllValidationData) => {
          // Fetch the item from the DB if only an ID is provided.
          if (Object.keys(item).length === 1 && item.id) {
            item = (await fetchCurrentPipelineResults(
              dataSource,
              VALIDATION_ENDPOINTS.UPLOAD,
              {
                id: { eq: { value: item.id } },
              },
            )) as unknown as IAllValidationData;
          }
          if (!item.validationResults) {
            PopUpMessage({
              type: "error",
              message: `Error Creating Report for ${item.id}.`,
            });
            return;
          }
          return downloadReportFile(item);
        }),
      );
    },
  };
}

export function hideItemAction(): TFileValidationAction {
  return {
    id: "hideItem",
    label: "Hide Item(s) From View",
    callback: async ({
      items,
      dataSource,
      setForceTableUpdate,
      setSelectedRows,
    }) => {
      // Create bulk upsert payload
      const payload = items.map((item) => ({
        id: item.id,
        type: VALIDATIONS.UPLOAD,
        attributes: { hidden: true },
      }));
      try {
        await dataSource.upsert({
          objectType: VALIDATION_ENDPOINTS.UPLOAD,
          payload: payload,
        });
        PopUpMessage({
          type: "success",
          message: "Item(s) hidden successfully.",
        });
        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      } catch (e) {
        PopUpMessage({
          type: "error",
          message: "Could not hide item(s), please try again.",
        });
      }
    },
    isAvailable: ({ items }) => items.every((item) => item.hidden === false),
  };
}

export function showItemAction(): TFileValidationAction {
  return {
    id: "showItem",
    label: "Show Item(s) in View",
    callback: async ({
      items,
      dataSource,
      setForceTableUpdate,
      setSelectedRows,
    }) => {
      // Create bulk upsert payload
      const payload = items.map((item) => ({
        id: item.id,
        type: VALIDATIONS.UPLOAD,
        attributes: { hidden: false },
      }));
      try {
        await dataSource.upsert({
          objectType: VALIDATION_ENDPOINTS.UPLOAD,
          payload: payload,
        });
        PopUpMessage({
          type: "success",
          message: "Item(s) set to visible.",
        });
        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      } catch (e) {
        PopUpMessage({
          type: "error",
          message: "Could not set item(s) to visible, please try again.",
        });
      }
    },
    isAvailable: ({ items }) => items.every((item) => item.hidden === true),
  };
}

export function downloadFileAction(): TFileValidationAction {
  return {
    id: "downloadFile",
    label: "Download Manifest(s)",
    callback: async ({ items, dataSource }) => {
      await Promise.all(
        // We need to map over items and fetch details for any items that only have an id,
        // as we need s3 info to proceed with download
        items.map(async (item: IAllValidationData) => {
          // If the item only has an id, we need to fetch full details to get s3 info
          if (Object.keys(item).length === 1 && item.id) {
            item = (await fetchCurrentPipelineResults(
              dataSource,
              VALIDATION_ENDPOINTS.UPLOAD,
              {
                id: { eq: { value: item.id } },
              },
            )) as unknown as IAllValidationData;
          }
          // If after fetching details we still don't have s3 info,
          // we cannot proceed with download
          if (!item.s3Bucket || !item.s3Filename) {
            PopUpMessage({
              type: "error",
              message: "Could not download file, missing file information.",
            });
            return;
          }
          // Proceed with download if we have s3 info
          return await downloadFileFromS3(
            dataSource,
            item.s3Bucket,
            item.s3Filename,
          );
        }),
      );
    },
  };
}

export function revalidateAction(): TFileValidationAction {
  return {
    id: "revalidate",
    label: "Revalidate Submission(s)",
    callback: async ({
      items,
      dataSource,
      setForceTableUpdate,
      setSelectedRows,
    }) => {
      const itemIds = items.map((item) => item.id);
      try {
        await dataSource.custom({
          method: API_METHODS.POST,
          resource: VALIDATION_ENDPOINTS.REVALIDATE,
          body: {
            data: {
              upload_ids: itemIds,
            },
          },
        });
        PopUpMessage({
          type: "success",
          message: "Revalidation started successfully.",
        });
        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      } catch (e) {
        PopUpMessage({
          type: "error",
          message: "Could not revalidate, please try again.",
        });
      }
    },
  };
}

export function markAsReadyAction(): TFileValidationAction {
  return {
    ...setValidationStatusAction(
      { id: "markAsReady", label: "Mark Item(s) as Ready" },
      "marked_as_ready",
    ),
    isAvailable: ({ items }) =>
      items.every(
        (item) =>
          item.validationStatus ===
            FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES ||
          item.validationStatus ===
            FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS,
      ),
  };
}

export function unmarkAsReadyAction(): TFileValidationAction {
  return {
    id: "unmarkAsReady",
    label: "Unmark Item(s) as Ready",
    callback: async ({
      items,
      dataSource,
      setForceTableUpdate,
      setSelectedRows,
    }) => {
      // Determine previous status and create payload array
      const payload = await Promise.all(
        items.map(async (item: TValidationContextItem) => {
          // If no validation results are provided for an item, we will need to query the database
          // This generally occurs when the action is being submitted from the table vs the viewing page.
          let result = {} as IAllValidationData | null;
          if (!item.validationResults) {
            result = await fetchCurrentPipelineResults(
              dataSource,
              VALIDATION_ENDPOINTS.UPLOAD,
              { id: { eq: { value: item.id } } },
            );
          }

          // Determine if the upload has warnings or not (we only need to check warnings vs no warnings)
          // Pass in the item, or failing that the found results
          const { warnings } = getErrorWarningCounts(
            item.validationResults || result?.validationResults || [],
          );

          // If warnings > 0, then previous status must have been validation_completed_passed_with_warnings
          const previousStatus =
            warnings > 0
              ? FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS
              : FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES;

          // Return the payload for that item with determined status
          return {
            id: item.id,
            type: "upload",
            attributes: { validation_status: previousStatus },
          };
        }),
      );

      try {
        const res = await dataSource.upsert({
          objectType: VALIDATION_ENDPOINTS.UPLOAD,
          payload: payload,
        });

        if (!res) {
          PopUpMessage({
            type: "error",
            message: "Could not complete - Unmark as Ready.",
          });
          return;
        }

        PopUpMessage({
          type: "success",
          message: "Unmark as Ready Successful.",
        });

        // Re-render the table and unselect the rows
        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      } catch {
        PopUpMessage({
          type: "error",
          message: "Could not complete - Unmark as Ready",
        });
      }
    },
    isAvailable: ({ items }) => {
      return items.every(
        (item) =>
          item.validationStatus === FILE_VALIDATION_STATUS.MARKED_AS_READY,
      );
    },
  };
}

export function rejectItemAction(): TFileValidationAction {
  return {
    id: "reject",
    label: "Reject Submission(s)",
    callback: ({ setSubmissionMutateModalOpen }) => {
      setSubmissionMutateModalOpen?.(true);
    },
    // Only admins can reject a submission
    isAvailable: ({ user }) => {
      return user?.roles.includes("admin") ?? false;
    },
  };
}

export function renameItemAction(): TFileValidationAction {
  return {
    id: "rename",
    label: "Rename Submission(s)",
    callback: ({ setSubmissionMutateModalOpen }) => {
      setSubmissionMutateModalOpen?.(true);
    },
  };
}

export function createBaseActions(): TFileValidationActionMap {
  return {
    viewReport: viewReportAction(),
    downloadReport: downloadReportAction(),
    hideItem: hideItemAction(),
    showItem: showItemAction(),
    downloadFile: downloadFileAction(),
    revalidate: revalidateAction(),
    markAsReady: markAsReadyAction(),
    unmarkAsReady: unmarkAsReadyAction(),
    reject: rejectItemAction(),
    rename: renameItemAction(),
  };
}

export function createBasePolicies() {
  return BASE_POLICIES_MAP;
}

// Leaving here to show how we're going to implement 'modes'
// export function createBaseModes() {
//   return BASE_MODES_MAP;
// }

export function createValidationModule<TCustom extends string = never>(
  overrides?: TFileValidationPolicyModuleOverrides,
): TFileValidationPolicyModule<TCustom> {
  // Create the base module with actions & policies
  const baseModule: TFileValidationPolicyModule = {
    actions: createBaseActions(),
    policies: createBasePolicies(),
  };

  // If no overrides are passed, return the base module
  if (!overrides) return baseModule as TFileValidationPolicyModule<TCustom>;

  // Otherwise expand the actions & policies with the overrides
  const actions = { ...baseModule.actions, ...(overrides.actions ?? {}) };
  const policies = {
    ...baseModule.policies,
  } as unknown as TFileValidationStatusPolicyMap<TCustom>;

  // We can overwrite attributes of specific policies, or add custom policies/statuses
  if (overrides.policies) {
    for (const [status, override] of Object.entries(
      overrides.policies,
    ) as Array<
      [
        TFileValidationStatus<TCustom>,
        Partial<TFileValidationStatusPolicy<TCustom>>,
      ]
    >) {
      // get each status in policy
      const base = policies[status];

      // If base policy isn't available, it's a new policy, but must be complete, with all required attributes
      if (!base) {
        policies[status] = override as TFileValidationStatusPolicy<TCustom>;
      } else {
        // Otherwise we override specific attributes of existing policies
        policies[status] = {
          ...base,
          ...override,
          // Would be best to be explicit about the status if not explicitly overridden.
          status: override.status ?? base.status,
        };
      }
    }
  }

  // If allowed actions have been expanded, create a new set of allowed actions for that status
  if (overrides.extendAllowedActions) {
    // Map over the overrides and extract status, e.g. "in_progress" & extra, e.g. "downloadReport"
    for (const [status, extra] of Object.entries(
      overrides.extendAllowedActions,
    ) as Array<[TFileValidationStatus<TCustom>, TFileValidationActionId[]]>) {
      // Set the status in the policy to the old policy item, expand allowed actions
      // Does not work with removing actions (This can be added later if necessary)
      const existing = policies[status];

      // Make a check to see if the all the required actions/policies/statuses are available
      if (!existing) {
        throw new Error(
          `extendAllowedActions references missing policy for status ${status}`,
        );
      }

      // Overwrite the actions allowed by that specific policy
      policies[status] = {
        ...policies[status],
        allowedActions: Array.from(
          new Set([...policies[status].allowedActions, ...extra]),
        ),
      };
    }
  }

  // Return expanded/custom actions and policies
  return {
    actions,
    policies,
  } as TFileValidationPolicyModule<TCustom>;
}
