/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps, truncateString } from "../general/utils";
import {
  ValidationIcon,
  ErrorViewer,
  getErrorWarningCounts,
  IValidationResult,
  determineStepStatus,
} from "./index";

interface Props {
  id: string;
  stepName: string;
  errors?: IValidationResult[];
  expanded?: boolean;
  onSeeAllErrors?: () => void;
}

const MAX_ERRORS_TO_DISPLAY = 2;

function ValidateStep(props: Props) {
  const { id, stepName, onSeeAllErrors, errors = [], expanded = false } = props;

  const issueCount = getErrorWarningCounts(errors);
  const hasErrors = issueCount.errors > 0 || issueCount.warnings > 0;

  const stepStatus = determineStepStatus(issueCount);

  const iconType =
    issueCount.errors > 0
      ? "xmark"
      : issueCount.warnings > 0
      ? "exclamation"
      : "check";

  return (
    <div className="tol-file-uploader-validate-step-outer-container">
      <div
        id={id}
        className={`tol-file-uploader-validate-step-inner-container ${
          hasErrors ? "error" : "passed"
        }`}
      >
        <div className="tol-file-uploader-validate-step-title-container">
          <h6 className="tol-file-uploader-validate-step-title">
            {truncateString(normaliseCaps(stepName))}
          </h6>
          <ValidationIcon
            iconType={iconType}
            size="lg"
            className={`tol-file-uploader-validate-step-icon ${stepStatus.className}`}
          />
        </div>
        {hasErrors ? (
          <div className="tol-file-uploader-validate-step-error-container">
            <div>
              <p className="tol-file-uploader-validate-step-error-number">
                {issueCount.warnings}{" "}
                {issueCount.warnings > 1 ? "Warnings" : "Warning"},{" "}
                {issueCount.errors} {issueCount.errors > 1 ? "Errors" : "Error"}
                :
              </p>
              {errors
                .slice(0, MAX_ERRORS_TO_DISPLAY)
                .map((error: IValidationResult, index: number) => (
                  <ErrorViewer
                    key={`${id}-error-${index}`}
                    message={error.detail}
                    errorType={error.severity}
                    stepName={error.stepName}
                    cellId={{
                      column: error.field ?? "all",
                      row: error.objectId || "N/A",
                    }}
                  />
                ))}
            </div>
            <div>
              {errors.length > MAX_ERRORS_TO_DISPLAY ? (
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

export default ValidateStep;
