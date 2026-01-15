/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TFileValidationStatuses } from "../interfaces";

export const VALIDATION_PURPOSE = {
  VALIDATE_ONLY: "Validate",
  VALIDATE_AND_UPLOAD: "Validate and Upload",
  VALIDATE_AND_MARK_AS_READY: "Validate and Mark as Ready",
};

export const VALIDATION_STATUSES = {
  IN_PROGRESS: "In Progress",
  FAILED: "Failed",
  PASSED: "Passed",
  PASSED_WITH_WARNINGS: "Passed with Warnings",
  COMPLETED_WITH_ERRORS: "Completed with Errors",
  MARKED_AS_READY: "Marked as Ready",

  UPLOADED_TO_STS: "Uploaded to STS",
  REJECTED: "Rejected",
  // ADDED_TO_DATABASE: "Added to Database",
};

export const VALIDATION_CONFIG: TFileValidationStatuses = [
  {
    validationStatus: VALIDATION_STATUSES.IN_PROGRESS,
    description:
      "The file is being validated and results should be available shortly.",
    textColor: "var(--tol-info)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.FAILED,
    description:
      "The validation process has failed. This is usually due to a server error. If it persists, speak to your Sanger contact.",
    textColor: "var(--tol-danger-light)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.PASSED,
    description:
      "The file has passed validation with no errors or warnings. You may now continue the submission process, if you have chosen not to do so automatically.",
    textColor: "var(--tol-success)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.PASSED_WITH_WARNINGS,
    description:
      "The file may have some formatting issues, that you may wish to fix, but you can submit if you wish to do so.",
    textColor: "var(--tol-warning)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.COMPLETED_WITH_ERRORS,
    description:
      "There are major issues with the data provided in the file, please check the interface or report and fix before re-submitting.",
    textColor: "var(--tol-danger)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.MARKED_AS_READY,
    description: "The file has been marked as ready for further processing.",
    textColor: "var(--tol-success-light)",
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.UPLOADED_TO_STS,
    description: "The manifest has been uploaded to STS",
    textColor: "var(--tol-info-light)",
    callback: function () {},
  },
  {
    validationStatus: VALIDATION_STATUSES.REJECTED,
    description:
      "Your submission has been rejected, please check the results page for a reason.",
    textColor: "var(--tol-danger-dark)",
    callback: function () {},
  },
];

export const FILE_VALIDATION_PATH = "/file-validation/results/";
export const REFRESH_INTERVAL = 1000;
export const MAX_ERRORS_TO_DISPLAY = 2;
export const BUTTON_TIMEOUT = 3000;
export const WIDTH_REDUCER = 40;
export const TOL_LOADER_STYLES = {
  minHeight: "250px",
  flexDirection: "column" as "column",
  alignItems: "center" as "center",
  display: "flex" as "flex",
};
export const DEFAULT_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
export const USER_SHOWN_FILE_TYPE_DEFAULTS = ".xlsx/.csv";
export const MAX_FILE_SIZE = "10mb";
export const DEFAULT_SHEET_NAME = "Metadata Entry";
export const VALIDATION_TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes
