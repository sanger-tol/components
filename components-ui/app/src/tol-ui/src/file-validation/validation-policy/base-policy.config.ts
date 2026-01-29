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
    allowedActions: [],
  },
  [FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES,
    rename: "Validation Completed - Passed (No Issues)",
    summary:
      "The file has passed validation with no errors or warnings. Please mark as ready to inform an admin that it is ready for further processing.",
    textColor: "var(--tol-success)",
    isFailureStatus: false,
    allowedActions: ["mark_as_ready", "downloadReport", "viewReport"],
  },
  [FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS,
    rename: "Validation Completed - Passed With Warnings",
    summary:
      "The file may have some formatting or minor issues. Please fix these, or mark as ready to inform an admin that it is ready for further processing.",
    textColor: "var(--tol-warning)",
    isFailureStatus: false,
    allowedActions: ["mark_as_ready", "downloadReport", "viewReport"],
  },
  [FILE_VALIDATION_STATUS.COMPLETED_FAILED_ERRORS]: {
    status: FILE_VALIDATION_STATUS.COMPLETED_FAILED_ERRORS,
    rename: "Validation Completed - Failed with Errors",
    summary:
      "There are major issues with the data provided in the file, please check the report and fix before re-submitting.",
    textColor: "var(--tol-danger)",
    isFailureStatus: false,
    allowedActions: ["downloadReport", "viewReport"],
  },
  [FILE_VALIDATION_STATUS.SYSTEM_ERROR]: {
    status: FILE_VALIDATION_STATUS.SYSTEM_ERROR,
    rename: "System Error",
    summary:
      "The validation process has failed due to a system error. Please try again and contact an admin if the issue persists.",
    textColor: "var(--tol-danger-light)",
    isFailureStatus: true,
    allowedActions: ["revalidate"],
  },
  [FILE_VALIDATION_STATUS.TIMEOUT]: {
    status: FILE_VALIDATION_STATUS.TIMEOUT,
    rename: "Validation Timed Out",
    summary:
      "The validation process has timed out. Please try again and contact an admin if the issue persists.",
    textColor: "var(--tol-danger-dark)",
    isFailureStatus: false,
    allowedActions: ["revalidate"],
  },
  [FILE_VALIDATION_STATUS.FILE_REJECTED]: {
    status: FILE_VALIDATION_STATUS.FILE_REJECTED,
    rename: "File Submission Rejected",
    summary:
      "The provided file has been rejected by an admin. Please see the rejection reason for further information.",
    textColor: "var(--tol-royal)",
    isFailureStatus: false,
    allowedActions: [],
  },
  [FILE_VALIDATION_STATUS.MARKED_AS_READY]: {
    status: FILE_VALIDATION_STATUS.MARKED_AS_READY,
    rename: "Marked as Ready",
    summary: "The file has been marked as ready for further processing.",
    textColor: "var(--tol-success-light)",
    isFailureStatus: false,
    allowedActions: ["unmark_as_ready", "downloadReport", "viewReport", "reject"],
  },
};

export const BASE_MODES_MAP = {};
