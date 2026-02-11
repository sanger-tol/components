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
} from "../..";

import type {
  TValidationActionId,
  TValidationActionMap,
  TFileValidationAction,
  TFileValidationStatus,
  TValidationPolicyModule,
  IAllValidationData,
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
    callback: async ({ items, dataSource, setForceTableUpdate }) => {
      const payload = items.map((item) => ({
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

        setForceTableUpdate((prev: boolean) => !prev);
      } catch (e) {
        PopUpMessage({
          type: "error",
          message: `Could not complete - ${action.label}`,
        });
      }
    },
  };
}

export async function rejectSubmission(
  rejectionReasons: { id: string; reason: string }[],
  setOpen: (open: boolean) => void,
): Promise<void> {
  const rejectionsPayload = rejectionReasons.map((reason) => {
    return {
      type: "upload",
      id: reason.id,
      attributes: {
        validation_status: "file_rejected",
        rejection_reason: reason.reason,
      },
    };
  });

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
    console.error(e)
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
        if (setReportOpen) setReportOpen(true);
      },
    },
    downloadReport: {
      id: "downloadReport",
      label: "Download Report",
      callback: async ({ items }) => {
        await Promise.all(
          items.map(async (item: IAllValidationData) => {
            if (Object.keys(item).length === 1 && item.id) {
              item = (await fetchCurrentPipelineResults(
                PIPELINE_DS,
                VALIDATION_ENDPOINTS.UPLOAD,
                item.id,
              )) as unknown as IAllValidationData;
            }
            if (
              !item.validationResults ||
              item.validationResults.length === 0
            ) {
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
                item.id,
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
      callback: async ({ items, dataSource, setForceTableUpdate }) => {
        // Send all ids as an array to do a bulk upsert,
        // regardless of how many items are being revalidated,
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
      ...setValidationStatusAction(
        { id: "unmarkAsReady", label: "Unmark as Ready" },
        "validation_completed_passed_no_issues", // not easy to determine previous status...
      ),
      isAvailable: ({ items }) =>
        items.every(
          (item) =>
            item.validationStatus === FILE_VALIDATION_STATUS.MARKED_AS_READY,
        ),
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
