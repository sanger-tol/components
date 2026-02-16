/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PIPELINE_DS,
  BASE_MODES_MAP,
  BASE_POLICIES_MAP,
  VALIDATION_ENDPOINTS,
  FILE_VALIDATION_STATUS,
  PopUpMessage,
  downloadReportFile,
  downloadFileFromS3,
  API_METHODS,
  fetchCurrentPipelineResults,
  getErrorWarningCounts,
} from "../..";

import type {
  TValidationActionId,
  TValidationActionMap,
  TFileValidationAction,
  TFileValidationStatus,
  TValidationPolicyModule,
  IAllValidationData,
  TValidationContextItem,
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
  action: { id: TValidationActionId; label: string },
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
        type: "upload", // TODO: Change to a constant
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

export async function rejectSubmission(
  rejections: { id: string; reason: string }[],
  setOpen: (open: boolean) => void,
): Promise<void> {
  const rejectionsPayload = rejections.map(
    (rejectedItem: { id: string; reason: string }) => {
      return {
        id: rejectedItem.id,
        type: "upload",
        attributes: {
          validation_status: FILE_VALIDATION_STATUS.FILE_REJECTED,
          rejection_reason: rejectedItem.reason,
        },
      };
    },
  );

  try {
    await PIPELINE_DS.upsert({
      objectType: VALIDATION_ENDPOINTS.UPLOAD,
      payload: rejectionsPayload,
    });

    PopUpMessage({
      type: "success",
      message: "Submission rejected successfully.",
    });

    setOpen?.(false);
  } catch (e) {
    console.error(e);
    PopUpMessage({
      type: "error",
      message: "Could not reject submission, please try again.",
    });
  }
}

export function createBaseActions(): TValidationActionMap {
  return {
    viewReport: {
      id: "viewReport",
      label: "View Report",
      callback: ({ setReportOpen }) => {
        setReportOpen?.(true);
      },
    },
    downloadReport: {
      id: "downloadReport",
      label: "Download Report",
      callback: async ({ items }) => {
        await Promise.all(
          items.map(async (item: IAllValidationData) => {
            // Fetch the item from the DB if only an ID is provided.
            if (Object.keys(item).length === 1 && item.id) {
              item = (await fetchCurrentPipelineResults(
                PIPELINE_DS,
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
    },
    hideItem: {
      id: "hideItem",
      label: "Hide From View",
      callback: async ({
        items,
        dataSource,
        setForceTableUpdate,
        setSelectedRows,
      }) => {
        // Create bulk upsert payload
        const payload = items.map((item) => ({
          id: item.id,
          type: "upload", // TODO: Change to a constant
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
    },
    showItem: {
      id: "showItem",
      label: "Show in View",
      callback: async ({
        items,
        dataSource,
        setForceTableUpdate,
        setSelectedRows,
      }) => {
        // Create bulk upsert payload
        const payload = items.map((item) => ({
          id: item.id,
          type: "upload", // TODO: Change to a constant
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
    },
    downloadFile: {
      id: "downloadFile",
      label: "Download Submitted File",
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
    },
    revalidate: {
      id: "revalidate",
      label: "Revalidate",
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
    },
    markAsReady: {
      ...setValidationStatusAction(
        { id: "markAsReady", label: "Mark as Ready" },
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
    },
    unmarkAsReady: {
      id: "unmarkAsReady",
      label: "Unmark as Ready",
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

            // Return the payload for that item
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
    },
    reject: {
      id: "reject",
      label: "Reject Submission(s)",
      callback: ({ setSubmissionRejectModalOpen }) => {
        setSubmissionRejectModalOpen?.(true);
      },
      // Only admins can reject a submission
      isAvailable: ({ user }) => user?.roles.includes("admin") ?? false,
    },
  };
}

export function createBasePolicies() {
  return BASE_POLICIES_MAP;
}

// TODO: Implement modes
export function createBaseModes() {
  return BASE_MODES_MAP;
}

export function createBaseValidationModule(): TValidationPolicyModule {
  return {
    actions: createBaseActions(),
    policies: createBasePolicies(),
  };
}
