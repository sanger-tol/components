/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import { History } from "history";
import {
  PopUpMessage,
  FILE_VALIDATION_PATH,
  submitFile,
  getUserFromLocalStorage,
} from "../..";

import type {
  TSeverity,
  TValidationIssues,
  IStepData,
  IFileData,
  IValidationResult,
  IValidationConfig,
  IAllValidationData,
  IValidatedDataReport,
  IValidationResultAPI,
  TFileValidationAction,
  TsDataSource,
  TFileValidationActionMap,
  TFileValidationStatusPolicyMap,
  TValidationActionContext,
  TFileValidationStatusPolicy,
  TFileValidationActionId,
  IDropdownButtonConfig,
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

export function splitS3FilenameString(filename: string = "") {
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
  setFileUploaded: (uploaded: boolean) => void,
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
  report += `File Name: ${jsonReport["uploadDetails"]["s3Filename"]}\n`;
  report += `Failure Reason: ${jsonReport["uploadDetails"]["failureMessage"] || "None"}\n`;
  report += `Rejection Reason: ${jsonReport["uploadDetails"]["rejectionReason"] || "None"}\n\n`;

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

/**
 * Builds dropdown action configurations for the validation uploads table.
 * Each returned action is only shown when all selected rows’ validation_status policies allow it.
 *
 * Invokes the underlying TFileValidationAction with a normalised context
 * containing the selected row IDs, shared TsDataSource, current user, and
 * any additional context (e.g. modal setters, table refresh).
 *
 * @param actions - Map of validation action IDs to their action definitions.
 * @param policies - Map of validation statuses to their policy metadata, including allowed actions.
 * @param dataSource - Data source used by actions to perform remote operations.
 * @param additionalCtx - Extra context merged into each action callback (e.g. UI state setters).
 * @returns An array of IDropdownButtonConfig objects, including a
 *          fallback “No Actions Available for Selection” entry when nothing is applicable.
 */

export const createValidationActions = (
  actions: TFileValidationActionMap,
  policies: TFileValidationStatusPolicyMap,
  dataSource: TsDataSource,
  additionalCtx: any,
  setActionId?: Dispatch<SetStateAction<string>>,
) => {
  // Get user for action callback context
  const user = getUserFromLocalStorage();
  // Render table actions based on current validation status
  const baseValidationActions = Object.values(actions)
    // Sort in alphabetical order, so renders in the same order each time
    .sort((a, b) => {
      return ("" + a.label).localeCompare(b.label);
    })
    .map((action: TFileValidationAction) => ({
      name: action.label,
      // Check visibility of an action in the dropdown
      isVisibleAction: (selectedRows: any[] = []) =>
        selectedRows.length > 0 &&
        // Make sure the action can be completed by every selected row before showing it
        selectedRows.every((row) => {
          // Get the validation status of the row
          const status = row?.validation_status?.props?.dataObject?.validation_status;

          // Check against the allowed actions of the current status
          const allowed = policies[status]?.allowedActions ?? [];

          // Return all allowed actions of that policy
          // After checking which hidden status action is allowed
          // hidden -> showItem | shown -> hideItem
          return allowed.includes(action.id);
        }) && // Check if the action itself declares an its availability
        (action.isAvailable
          ? action.isAvailable({
              items: Object.values(selectedRows).map((row) =>
                row.key
                  ? {
                      id: row.key,
                      validationStatus: row?.validation_status?.props?.dataObject?.validation_status,
                      hidden: row?.hidden?.props?.dataObject?.hidden,
                    }
                  : row,
              ),
              user: user,
            })
          : // If it doesn't, then return true and constrain against something else if necessary
            true),
      // Perform the selected action upon click
      action: async (selectedRows: any[] = []) => {
        // Extract the ids to satisfy the { id: string }[] type
        const rowIds = Object.values(selectedRows).map((row) => ({
          id: row.key,
        }));
        setActionId?.(action.id);
        // Provide the action callback with the required context to perform the action.
        action.callback({
          items: rowIds,
          dataSource: dataSource,
          user: user,
          ...additionalCtx,
        });
      },
    }));

  // Fallback "no actions available" dropdown list
  const noActionsAvailableAction = {
    name: "No Actions Available for Selection",
    disabled: true,
    isVisibleAction: (selectedRows: any[] = []) =>
      // If no valid actions are available, return true to show this placeholder action
      // Also show if no actions have been selected
      !baseValidationActions.some((action) =>
        action.isVisibleAction ? action.isVisibleAction(selectedRows) : true,
      ),
  };

  // build and return final actions array
  // BaseValidationActions and noActionsAvailableAction are mutually exclusive
  const validationActions = [
    ...baseValidationActions,
    noActionsAvailableAction,
  ];

  return validationActions;
};

/**
 * Creates dropdown action configurations for a single validation upload page.
 *
 * Generates a list of allowed actions based on the current upload's validation status policy.
 * Each action is filtered by availability and mapped to a dropdown button configuration.
 * When an action is clicked, it executes the action callback and invalidates the related
 * query cache to trigger a page update.
 *
 * @param uploadStatus - The validation status policy for the current upload, containing allowed actions.
 * @param actionContext - The context object passed to action callbacks, containing upload and user details.
 * @param allActions - Map of all available validation actions indexed by action ID.
 * @param setCurrentActionId - State setter to track the currently executing action ID.
 * @param uploadId - The unique identifier of the upload being acted upon.
 * @param queryClient - The TanStack React Query client instance used to invalidate cache.
 * @returns An array of IDropdownButtonConfig objects representing available dropdown actions,
 *          or an empty array if uploadStatus or actionContext is undefined.
 */

export function createPageActions(
  uploadStatus: TFileValidationStatusPolicy | undefined,
  actionContext: TValidationActionContext | null,
  allActions: TFileValidationActionMap,
  setCurrentActionId: Dispatch<SetStateAction<string | null>>,
  uploadId: string,
  queryClient: any,
  refetch?: () => Promise<any>,
): IDropdownButtonConfig[] {
  // Create page dropown actions
  if (!uploadStatus || !actionContext) return [];
  const dropdownActions =
    // Ensure there is a status and context
    uploadStatus && actionContext
      ? uploadStatus.allowedActions
          // Sort actions alphabetically
          .sort((a: string, b: string) => {
            return ("" + a).localeCompare(b);
          })
          // Map over each action id and return the action of that ID
          .map((actionId: TFileValidationActionId) => allActions[actionId])
          // Filter out any actions not available
          .filter((action: TFileValidationAction) => {
            if (!action) return false;
            return !action.isAvailable || action.isAvailable(actionContext);
          })
          // Map over the rest of the available actions
          .map((action: TFileValidationAction) => ({
            name: action.label,
            action: async () => {
              // Complete the action
              setCurrentActionId(action.id);
              await action.callback(actionContext);
              if (refetch) {
                // Manually refetch data, once useQueryData stops querying
                await refetch();
              } else {
                // Invalidate the query in cache to update the page
                await queryClient.invalidateQueries({
                  queryKey: ["latestPipelineResults", uploadId],
                });
              }
            },
          }))
      : [];

  return dropdownActions;
}
