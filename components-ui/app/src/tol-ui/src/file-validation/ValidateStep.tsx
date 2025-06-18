/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps, truncateString } from "../general/utils";
import { ValidationIcon, ErrorViewer } from "./index";

interface Props {
  id: string;
  stepName: string;
  errorValues?: string[];
  expanded?: boolean;
  onSeeAllErrors?: () => void;
}

const MAX_ERRORS_TO_DISPLAY = 2;
const MAX_CHAR_LENGTH = 50;

function ValidateStep(props: Props) {
  const {
    id,
    stepName,
    onSeeAllErrors,
    errorValues = [],
    expanded = false,
  } = props;

  const hasErrors = !!errorValues && errorValues.length > 0;

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
            {truncateString(normaliseCaps(stepName), MAX_CHAR_LENGTH)}
          </h6>
          <ValidationIcon
            iconType={hasErrors ? "xmark" : "check"}
            size="lg"
            className={`tol-file-uploader-validate-step-icon ${
              hasErrors ? "error" : "passed"
            }`}
          />
        </div>
        {hasErrors ? (
          <div className="tol-file-uploader-validate-step-error-container">
            <div>
              <p className="tol-file-uploader-validate-step-error-number">
                {errorValues.length}{" "}
                {errorValues.length > 1 ? "Errors" : "Error"}:
              </p>
              {errorValues
                .slice(0, MAX_ERRORS_TO_DISPLAY)
                .map((error: string, index: number) => (
                  <ErrorViewer
                    key={`${id}-error-${index}`}
                    message={error}
                    errorType={"warning"} // TODO: Don't hardcode this
                    stepName={stepName}
                  />
                ))}
            </div>
            <div>
              {errorValues.length > MAX_ERRORS_TO_DISPLAY ? (
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
