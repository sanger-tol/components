/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ValidationIcon,
  ErrorViewer,
  getErrorWarningCounts,
  determineStepStatus,
  normaliseCaps,
  MAX_ERRORS_TO_DISPLAY,
  IconTooltip,
} from "../..";

import type { IValidationResult, IStepDetails } from "../..";

export interface PValidateStep {
  /**
   * Id of the step, used as a key for the component
   */
  id: string;
  /**
   * Optional callback when clicking to see all errors for the step
   */
  onSeeAllErrors?: () => void;
  /**
   * Optional whether the step details are expanded
   */
  expanded?: boolean;
  /**
   * Optional details of the validation step, if not provided will default to empty values and not show any errors
   */
  stepDetails?: IStepDetails;
  /**
   * Optional description of the step, shown in an info tooltip next to the step name
   */
  description?: string;
}

export function ValidateStep(props: PValidateStep) {
  const {
    id,
    onSeeAllErrors,
    expanded = false,
    stepDetails = {
      stepName: "",
      results: [],
      description: "",
      validationDetails: {
        completed: false,
        failureMessage: null,
      },
    },
  } = props;

  const issueCount = getErrorWarningCounts(stepDetails.results);
  const hasErrors = issueCount.errors > 0 || issueCount.warnings > 0;
  const stepStatus = determineStepStatus(issueCount);

  const iconType = stepDetails.validationDetails?.failureMessage
    ? "question"
    : issueCount.errors > 0
      ? "xmark"
      : issueCount.warnings > 0
        ? "exclamation"
        : "check";

  return (
    <div className="tol-file-uploader-validate-step-outer-container">
      <div
        id={id}
        className={`tol-file-uploader-validate-step-inner-container ${
          (!stepDetails.validationDetails?.completed && !hasErrors) ||
          stepDetails.validationDetails?.failureMessage
            ? "in-progress"
            : stepStatus.className
        }`}
      >
        <div className="tol-file-uploader-validate-step-title-container">
          <h6 className="tol-file-uploader-validate-step-title">
            <IconTooltip
              contents={stepDetails.description || "No description provided."}
            />{" "}
            {normaliseCaps(stepDetails.stepName)}
          </h6>
          <ValidationIcon
            iconType={iconType}
            size="lg"
            className={`tol-file-uploader-validate-step-icon ${
              stepDetails.validationDetails?.completed &&
              !stepDetails.validationDetails?.failureMessage
                ? stepStatus.className
                : "in-progress"
            }`}
            completed={stepDetails.validationDetails?.completed}
            completedCheck={true}
            failed={!!stepDetails.validationDetails?.failureMessage}
          />
        </div>
        {hasErrors ? (
          <div className="tol-file-uploader-validate-step-error-container">
            <div>
              <p className="tol-file-uploader-validate-step-error-number">
                {issueCount.warnings}{" "}
                {issueCount.warnings !== 1 ? "Warnings" : "Warning"},{" "}
                {issueCount.errors}{" "}
                {issueCount.errors !== 1 ? "Errors" : "Error"}:
              </p>
              {stepDetails.results
                .sort((a, b) => {
                  if (a.severity !== b.severity) {
                    return a.severity === "error" ? -1 : 1;
                  }
                  return Number(a.objectId) - Number(b.objectId);
                })
                .slice(0, MAX_ERRORS_TO_DISPLAY)
                .map((result: IValidationResult) => (
                  <ErrorViewer
                    key={`${result.objectId}-${result.field}-${result.stepName}`}
                    message={result.detail}
                    errorType={result.severity}
                    stepName={result.stepName}
                    cellId={{
                      column: result.field
                        ? Array.isArray(result.field)
                          ? result.field.join(", ")
                          : result.field
                        : "all",
                      row: result.objectId || "N/A",
                    }}
                    truncate={true}
                  />
                ))}
            </div>
            <div>
              {stepDetails.results.length > MAX_ERRORS_TO_DISPLAY ? (
                <div
                  className="tol-file-uploader-validate-step-see-all-container"
                  onClick={onSeeAllErrors}
                >
                  <p className="tol-file-uploader-validate-step-info">
                    See All...
                  </p>
                </div>
              ) : (
                <div className="tol-file-uploader-validate-step-no-errors-container">
                  <p className="tol-file-uploader-validate-step-info">
                    No More Errors...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : !stepDetails.validationDetails?.completed ? (
          <div className="tol-file-uploader-validate-step-passed-container">
            <h6>Waiting for some Results...</h6>
          </div>
        ) : stepDetails.validationDetails?.failureMessage ? (
          <div className="tol-file-uploader-validate-step-failed-container">
            <h6>Pipeline Failed</h6>
            <p>
              Could not validate before the overall pipeline failed. Please
              re-upload and try again.
            </p>
          </div>
        ) : (
          <div className="tol-file-uploader-validate-step-passed-container">
            <h6>Validation Passed 🎉</h6>
          </div>
        )}
      </div>
      {expanded && <div className="tol-file-upload-step-triangle" />}
    </div>
  );
}
