/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FILE_VALIDATION_STATUS } from "./validation-policy.types";
import { TFileValidationStatusPolicyMap } from "../..";

export const BASE_POLICIES_MAP: TFileValidationStatusPolicyMap = {
  [FILE_VALIDATION_STATUS.IN_PROGRESS]: {
    status: FILE_VALIDATION_STATUS.IN_PROGRESS,
    rename: "Validation in Progress",
    summary:
      "The file is being validated and results should be available shortly.",
    textColor: "var(--tol-info)",
    isFailureStatus: false,
    allowedActions: ["downloadFile", "hideItem", "showItem"],
  },
  [FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES,
    rename: "Validation Completed - Passed (No Issues)",
    summary:
      "The file has passed validation with no errors or warnings. Please 'Mark as Ready' after which it will be uploaded to the next stage of sample submission and no further edits to this manifest / sample set will be possible.",
    textColor: "var(--tol-success)",
    isFailureStatus: false,
    allowedActions: [
      "markAsReady",
      "downloadReport",
      "viewReport",
      "downloadFile",
      "hideItem",
      "showItem",
    ],
    messageType: "success",
    message: "Validation Completed. Validation has passed with no issues.",
  },
  [FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS,
    rename: "Validation Completed - Passed With Warnings",
    summary:
      "There are minor issues with some data in the manifest. You may fix these or 'Mark as Ready'. Refer to the Manifest SOP for guidance.",
    textColor: "var(--tol-warning)",
    isFailureStatus: false,
    allowedActions: [
      "markAsReady",
      "downloadReport",
      "viewReport",
      "downloadFile",
      "hideItem",
      "showItem",
    ],
    messageType: "warning",
    message: "Validation Completed. Validation has passed some warnings.",
  },
  [FILE_VALIDATION_STATUS.COMPLETED_FAILED_ERRORS]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_FAILED_ERRORS,
    rename: "Validation Completed - Failed with Errors",
    summary:
      "There are major issues with the data provided in the file. Check the report and fix before re-submitting. Refer to the Manifest SOP for guidance.",
    textColor: "var(--tol-danger)",
    isFailureStatus: false,
    allowedActions: [
      "downloadReport",
      "viewReport",
      "downloadFile",
      "hideItem",
      "showItem",
    ],
    messageType: "error",
    message:
      "Validation Completed. Validation has failed with errors. Please fix before resubmitting.",
  },
  [FILE_VALIDATION_STATUS.SYSTEM_ERROR]: {
    status: FILE_VALIDATION_STATUS.SYSTEM_ERROR,
    rename: "System Error",
    summary:
      "The validation process has failed due to a system error. Please try again and contact an admin if the issue persists.",
    textColor: "var(--tol-danger-light)",
    isFailureStatus: true,
    allowedActions: ["revalidate", "downloadFile", "hideItem", "showItem"],
    messageType: "error",
    message:
      "Validation Could not complete. A system error has occurred. Please try again.",
  },
  [FILE_VALIDATION_STATUS.TIMEOUT]: {
    status: FILE_VALIDATION_STATUS.TIMEOUT,
    rename: "Validation Timed Out",
    summary:
      "The validation process has timed out. Please try again and contact an admin if the issue persists.",
    textColor: "var(--tol-danger-light)",
    isFailureStatus: false,
    allowedActions: ["revalidate", "downloadFile", "hideItem", "showItem"],
    messageType: "error",
    message:
      "Validation Could not complete. The system has timed out. Please try again.",
  },
  [FILE_VALIDATION_STATUS.FILE_REJECTED]: {
    status: FILE_VALIDATION_STATUS.FILE_REJECTED,
    rename: "File Submission Rejected",
    summary:
      "The provided file has been rejected by an admin. Please see the rejection reason for further information.",
    textColor: "var(--tol-royal)",
    isFailureStatus: false,
    allowedActions: ["downloadFile", "hideItem", "showItem"],
  },
  [FILE_VALIDATION_STATUS.MARKED_AS_READY]: {
    status: FILE_VALIDATION_STATUS.MARKED_AS_READY,
    rename: "Marked as Ready",
    summary:
      "Manifest has been 'Marked as Ready' and will be uploaded to the next stage of sample submission.",
    textColor: "var(--tol-success-light)",
    isFailureStatus: false,
    allowedActions: [
      "unmarkAsReady",
      "downloadReport",
      "viewReport",
      "reject",
      "downloadFile",
      "hideItem",
      "showItem",
    ],
  },
};

// Leaving here to show how we're going to implement 'modes'
// export const BASE_MODES_MAP = {};
