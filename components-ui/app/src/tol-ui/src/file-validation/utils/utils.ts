/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { History } from "history";
import {
  PopUpMessage,
  FILE_VALIDATION_PATH,
  submitFile,
  markFileAsReady,
} from "../..";

import type {
  TSeverity,
  TMessageType,
  TValidationIssues,
  IStepData,
  IFileData,
  IValidationResult,
  IValidationConfig,
  IAllValidationData,
  IValidatedDataReport,
  IValidationResultAPI,
} from "../..";

/**
 * Counts the number of errors and warnings in a list of validation results.
 *
 * @param results - An array of IValidationResult objects to analyze.
 * @returns An object containing the total number of errors and warnings.
 *
 * If the input is not an array, returns { errors: 0, warnings: 0 }.
 */

export function getErrorWarningCounts(results: IValidationResult[]): {
  errors: number;
  warnings: number;
} {
  if (!Array.isArray(results)) {
    return { errors: 0, warnings: 0 };
  }
  return results.reduce(
    (acc, result) => {
      if (result.severity === "warning") {
        acc.warnings += 1;
      } else if (result.severity === "error") {
        acc.errors += 1;
      }
      return acc;
    },
    { errors: 0, warnings: 0 },
  );
}

/**
 * Removes the first two segments (app_env and unique identifier) from an S3 filename.
 *
 * Example: `123_456_file.txt` -> `file.txt`
 *
 * @param filename - The full S3 filename.
 * @returns The cleaned filename.
 */

export function splitS3FilenameString(filename: string) {
  return filename.split("_").slice(2).join("_");
}

/**
 * Normalises a validation result received from the API into the internal IValidationResult format.
 *
 * @param result - The raw validation result object from the API.
 * @returns An IValidationResult object with mapped and defaulted fields.
 */

export function normaliseValidationResult(
  result: IValidationResultAPI,
): IValidationResult {
  return {
    code: result.code,
    detail: result.detail,
    field: result.field || null,
    objectId: result.object_id,
    severity: result.severity,
    stepName: result.step_name,
  };
}

/**
 * Constructs a completion message and message type based on validation results and failure status.
 *
 * @param validationResults - An array of IValidationResult objects to analyze for errors and warnings.
 * @param failureMessage - An optional failure message string indicating early termination.
 * @returns An object containing a user-friendly message and its corresponding message type.
 *
 * The returned message and type reflect whether validation passed, failed, completed with warnings,
 * or was terminated early due to a failure.
 */

export function constructCompletionMessage(
  validationResults: IValidationResult[],
  failureMessage: string | null,
): { message: string; messageType: TMessageType } {
  const errorsAndWarnings = getErrorWarningCounts(validationResults);
  if (failureMessage) {
    return {
      message: `Validation terminated early: ${failureMessage}. File cannot be uploaded`,
      messageType: "error",
    };
  } else if (
    errorsAndWarnings.errors === 0 &&
    errorsAndWarnings.warnings === 0
  ) {
    return {
      message: "Validation passed successfully with no issues.",
      messageType: "success",
    };
  } else if (errorsAndWarnings.errors > 0) {
    return {
      message: `File failed validation with ${errorsAndWarnings.errors} error(s). File cannot be uploaded.`,
      messageType: "error",
    };
  } else if (errorsAndWarnings.warnings > 0) {
    return {
      message: `File passed validation with ${errorsAndWarnings.warnings} warning(s).`,
      messageType: "warning",
    };
  }
  return {
    message: "Could not detemine completion status.",
    messageType: "info",
  };
}

/**
 * Determines the status of a pipeline step based on the number of errors and warnings.
 *
 * @param errorCount - An object containing the number of errors and warnings for the step.
 * @returns An object with a CSS class name and a status text string representing the step's status.
 *
 * Returns "error" if there are errors, "warning" if there are warnings, and "passed" if there are neither.
 */

export function determineStepStatus(errorCount: {
  errors: number;
  warnings: number;
}) {
  if (errorCount.errors > 0) {
    return { className: "error", text: "Error" };
  } else if (errorCount.warnings > 0) {
    return { className: "warning", text: "Warning" };
  }
  return { className: "passed", text: "Passed" };
}

/**
 * Navigates to the results page for a specific pipeline upload, optionally including a step name in the query string.
 *
 * @param history - The history object used to perform navigation.
 * @param pipelineId - The ID of the pipeline upload to view results for.
 * @param stepName - (Optional) The name of the step to highlight in the results view.
 * @param errorWarningCount - (Optional) The total number of errors and warnings; if greater than 2 and stepName is provided, the stepName is included in the query string.
 */

export function goToResults(
  history: History,
  pipelineId: string,
  stepName?: string,
  errorWarningCount: number = 0,
) {
  history.push(
    `${FILE_VALIDATION_PATH}${pipelineId}${
      errorWarningCount > 2 && stepName ? `?stepName=${stepName}` : ""
    }`,
  );
}

/**
 * Handles file submission logic based on validation state and upload status.
 *
 * If the file is submittable, it initiates the file submission process.
 * If the file is not submittable, it marks the file as ready.
 * Otherwise, it logs an error and displays an error popup message.
 *
 * @param validationConfig - Configuration object containing validation rules and settings
 * @param fileList - Array of file data objects to be processed
 * @param submittable - Flag indicating whether the file can be submitted
 * @param currentUploadId - The unique identifier for the current upload, or null if not available
 * @param setFileUploaded - Callback function to update the file uploaded state
 * @param setMarkedAsReady - Callback function to update the marked as ready state
 *
 * @returns void
 *
 * @throws Will log an error and show a popup if currentUploadId is null when trying to mark as ready
 */

export function onSubmission(
  validationConfig: IValidationConfig,
  fileList: IFileData[],
  submittable: boolean,
  currentUploadId: string | null,
  setFileUploaded: (uploaded: boolean) => void
  // setMarkedAsReady: () => void,
): void {
  if (submittable) {
    submitFile(validationConfig, fileList, currentUploadId, setFileUploaded);
  } else if (currentUploadId) {
    // markFileAsReady(currentUploadId, setMarkedAsReady);
  } else {
    console.error("currentUploadId is required to mark file as ready.");
    PopUpMessage({
      type: "error",
      message: "Cannot mark file as ready: upload ID is missing.",
    });
  }
}

/**
 * Aggregates validation results by unique issue and collects the affected object IDs.
 *
 * Builds a stable “issue key” from `severity`, `field`, and `detail`, then groups all
 * `objectId`s for results sharing the same key.
 *
 * The returned record uses keys of the form:
 * `${severity}|~${field}|~${detail}`
 *
 * Example:
 * - Two results with the same severity/field/detail but different `objectId`s will
 *   produce one entry with both IDs in the array.
 *
 * @param results - Validation results to group.
 * @returns A map of issue key → array of object IDs affected by that issue.
 */

export function aggregateObjectIdsByIssue(
  results: IValidationResult[],
): Record<string, string[]> {
  return results.reduce(
    (acc, result) => {
      // Create a unique key for each issue based on severity, field, and detail
      const key = `${result.severity}|~${result.field}|~${result.detail}`;

      // Initialize the array if the key doesn't exist
      if (!acc[key]) {
        acc[key] = [];
      }

      // Append the object ID to the corresponding issue key if not already present
      acc[key].push(result.objectId);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}

/**
 * Formats an array of row/object IDs into a compact, human-readable range string.
 *
 * Sorts the IDs numerically, removes duplicates, and collapses consecutive values
 * into ranges.
 *
 * Examples:
 * - `["1", "2", "3", "5", "6", "8"]` → `"1-3,5-6,8"`
 * - `["4"]` → `"4"`
 * - `["2", "2", "1"]` → `"1-2"`
 *
 * Note: IDs are treated as numeric strings (converted with `Number(...)`).
 *
 * @param objectIds - Array of IDs (as strings) to format.
 * @returns A comma-separated string of IDs and ranges.
 */

export function formatAndConcatObjectIds(objectIds: string[]): string {
  // Sort and remove duplicates
  const sortedIds = [
    ...new Set(objectIds.sort((a, b) => Number(a) - Number(b))),
  ];

  const ranges: string[] = [];
  let start = sortedIds[0];
  let end = start;

  // Build ranges
  for (let i = 1; i < sortedIds.length; i++) {
    // Check if current ID is consecutive
    if (sortedIds[i] === String(Number(end) + 1)) {
      // Extend the current range if consecutive
      end = sortedIds[i];
    } else {
      // If not, push the current range and reset
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sortedIds[i];
      end = start;
    }
  }

  // Push the final range
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(", ");
}

/**
 * Constructs a structured validation report from raw validation data.
 *
 * This function processes validation data and organizes it into a structured report format
 * suitable for display or export. It aggregates validation results by pipeline step,
 * groups similar issues together, and formats object IDs into readable ranges.
 *
 * @param validationData - The complete validation data object containing upload details and validation results
 * @returns A structured validation report object with upload details and organized issues
 */

export function constructValidationReport(validationData: IAllValidationData) {
  const { validationResults, pipelineSteps, s3Filename, ...rest } =
    validationData;

  let validationReport: IValidatedDataReport = {
    title: "Validation Report",
    uploadDetails: {
      s3Filename: splitS3FilenameString(s3Filename || ""),
      pipelineSteps: pipelineSteps
        ? pipelineSteps.map((step: IStepData) => step.name).join(", ")
        : "",
      ...rest,
    },
    issues: {} as TValidationIssues,
  };

  validationData?.pipelineSteps?.map((step: IStepData) => {
    const stepErrors = validationData.validationResults.filter(
      (result: IValidationResult) => result.stepName === step.name,
    );

    if (stepErrors.length === 0) return;
    const aggregatedResults = aggregateObjectIdsByIssue(stepErrors);

    Object.entries(aggregatedResults).map(([k, objectIds]) => {
      const [severity, field, detail] = k.split("|~");
      if (!validationReport.issues[step.name]) {
        validationReport.issues[step.name] = [];
      }

      validationReport.issues[step.name].push({
        severity: severity as TSeverity,
        field: field,
        detail: detail,
        objectId: formatAndConcatObjectIds(objectIds),
      });
    });
  });

  return validationReport;
}

/**
 * Downloads a validation report file as a formatted text document.
 *
 * This function generates a comprehensive validation report from the provided validation data,
 * formats it as a human-readable text file, and triggers a browser download. The report includes
 * upload details, pipeline information, and a structured list of all validation issues organized by step.
 *
 * @param data - The validation data object containing all upload and validation information
 * @returns void - The function doesn't return a value but triggers a file download
 */

export function downloadReportFile(data: IAllValidationData) {
  const jsonReport = constructValidationReport(data);

  // create readable report from json
  // start report
  let report: string = `${jsonReport["title"]} for ${
    jsonReport["uploadDetails"]["s3Filename"]
  }\n${"=".repeat(50)}\n\n`;

  // upload details
  report += `Upload Details:\n${"-".repeat(20)}\n`;
  report += `Validation ID: ${jsonReport["uploadDetails"]["id"]}\n`;
  report += `Date Started: ${new Date(
    jsonReport["uploadDetails"]["dateStarted"],
  ).toString()}\n`;
  report += `Pipeline Name: ${jsonReport["uploadDetails"]["pipelineName"]}\n`;
  report += `File Name: ${jsonReport["uploadDetails"]["s3Filename"]}\n\n`;

  // issues
  report += `Validation Issues:\n${"-".repeat(20)}\n`;
  Object.entries(jsonReport.issues).length > 0
    ? Object.entries(jsonReport.issues).map(([stepName, issuesArray]) => {
        report += `Validation: ${stepName} -\n`;
        issuesArray.forEach((issue, index) => {
          report += `${index + 1}. [${issue.severity}] Column: ${
            issue.field
          }\n`;
          report += `  - Issue: ${issue.detail}\n`;
          report += `  - Affected Row Number(s): ${issue.objectId}\n\n`;
        });
      })
    : (report += "No issues found.\n");

  //end report
  report += `${"-".repeat(20)}\n`;
  report += "End of report.";

  const blob = new Blob([report], {
    type: "text/plain; charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `validation-report-${jsonReport["uploadDetails"]["s3Filename"]}.txt`;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}
