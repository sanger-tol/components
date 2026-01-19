/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TFileValidationStatuses, VALIDATION_STATUSES } from "..";

export const VALIDATION_CONFIG: TFileValidationStatuses = [
  {
    validationStatus: VALIDATION_STATUSES.IN_PROGRESS,
    description:
      "The file is being validated and results should be available shortly.",
    textColor: "var(--tol-info)",
    projects: [],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.FAILED,
    description:
      "The validation process has failed. This is usually due to a server error. If it persists, speak to your Sanger contact.",
    textColor: "var(--tol-danger-light)",
    projects: [],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.PASSED,
    description:
      "The file has passed validation with no errors or warnings. You may now continue the submission process, if you have chosen not to do so automatically.",
    textColor: "var(--tol-success)",
    projects: [],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.PASSED_WITH_WARNINGS,
    description:
      "The file may have some formatting issues, that you may wish to fix, but you can submit if you wish to do so.",
    textColor: "var(--tol-warning)",
    projects: [],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.COMPLETED_WITH_ERRORS,
    description:
      "There are major issues with the data provided in the file, please check the interface or report and fix before re-submitting.",
    textColor: "var(--tol-danger)",
    projects: [],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.MARKED_AS_READY,
    description: "The file has been marked as ready for further processing.",
    textColor: "var(--tol-success-light)",
    projects: ["portal"],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.UPLOADED_TO_STS,
    description: "The manifest has been uploaded to STS.",
    textColor: "var(--tol-info-light)",
    projects: ["portal"],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.ADDED_TO_DATABASE,
    description: "The data from spreadsheet has been added to the database.",
    textColor: "var(--tol-info-light)",
    projects: ["treeofsex"],
    callback: () => {},
  },
  {
    validationStatus: VALIDATION_STATUSES.REJECTED,
    description:
      "Your submission has been rejected, please check the results page for a reason.",
    textColor: "var(--tol-royal)",
    projects: [],
    callback: () => {},
  },
];