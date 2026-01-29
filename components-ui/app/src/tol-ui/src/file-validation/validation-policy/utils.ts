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
} from "../..";

import type {
  TValidationActionId,
  TValidationActionMap,
  TFileValidationAction,
  TFileValidationStatus,
  TValidationPolicyModule,
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
    callback: async ({ item, dataSource }) => {
      try {
        const res = await dataSource.upsert({
          objectType: VALIDATION_ENDPOINTS.UPLOAD,
          payload: [
            {
              type: "upload",
              id: item.id,
              attributes: { validation_status: status },
            },
          ],
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
  rejectionReason: string,
  uploadId: string,
  setOpen: (open: boolean) => void,
): Promise<void> {
  if (rejectionReason === "") {
    PopUpMessage({
      type: "error",
      message: "Please enter a rejection reason before submitting.",
    });
    return;
  }

  try {
    await PIPELINE_DS.upsert({
      objectType: VALIDATION_ENDPOINTS.UPLOAD,
      payload: [
        {
          type: "upload",
          id: uploadId,
          attributes: {
            validation_status: "file_rejected",
            rejection_reason: rejectionReason,
          },
        },
      ],
    });

    PopUpMessage({
      type: "success",
      message: "Submission rejected successfully.",
    });

    setOpen?.(false);
  } catch (e) {
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
      callback: ({ item }) => downloadReportFile(item),
    },
    revalidate: {
      id: "revalidate",
      label: "Revalidate",
      callback: ({ item }) => dataSource.custom({}),
    },
    mark_as_ready: {
      ...setValidationStatusAction(
        { id: "mark_as_ready", label: "Mark as Ready" },
        "marked_as_ready",
      ),
      isAvailable: ({ item }) =>
        item.validationStatus ===
          FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES ||
        item.validationStatus ===
          FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS,
    },
    unmark_as_ready: {
      ...setValidationStatusAction(
        { id: "unmark_as_ready", label: "Unmark as Ready" },
        "validation_completed_passed_no_issues", // not easy to determine previous status
      ),
      isAvailable: ({ item }) =>
        item.validationStatus === FILE_VALIDATION_STATUS.MARKED_AS_READY,
    },
    reject: {
      id: "reject",
      label: "Reject Submission",
      callback: ({ setSubmissionRejectModalOpen }) => {
        if (setSubmissionRejectModalOpen) setSubmissionRejectModalOpen(true);
      },
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
