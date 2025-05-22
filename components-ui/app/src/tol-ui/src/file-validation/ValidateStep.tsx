/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ValidationIcon, ErrorViewer } from "./index";
import { IconType } from "./ValidationIcon";

interface Props {
  id: string;
  stepName: string;
  icon?: IconType;
  errorValues?: string[];
  expanded?: boolean;
  onSeeAllErrors?: () => void;
}

const MAX_ERRORS_TO_DISPLAY = 2;

const vOrC = "Validation";
const errors = true; // Simulating an error state
const errorValues = ["Error 1", "error 2", "Error 3"]; // Simulating error values

// return "var(tol-success-translucent"; for success
// return "var(tol-danger-translucent"; for error

function ValidateStep(props: Props) {
  const { id, stepName, onSeeAllErrors, icon = "xmark", expanded } = props;
  return (
    <div className="tol-file-uploader-validate-step-outer-container">
      <div id={id} className="tol-file-uploader-validate-step-inner-container">
        <div className="tol-file-uploader-validate-step-title-container">
          <h6 className="tol-file-uploader-validate-step-title">
            Validate {stepName}
          </h6>
          <ValidationIcon
            iconType={errors ? "xmark" : "check"}
            size="lg"
            style={{
              backgroundColor: errors
                ? "var(--tol-danger)"
                : "var(--tol-success)",
            }}
            className="tol-file-uploader-validate-step-icon"
          />
        </div>
        {errors ? (
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
                    key={String(index)}
                    message={error}
                    stepName={stepName}
                  />
                ))}
            </div>
            <div>
              {errorValues.length > 2 ? (
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
            <h6>{vOrC} Passed 🎉</h6>
          </div>
        )}
      </div>
      {expanded && <div className="tol-file-upload-step-triangle" />}
    </div>
  );
}

export default ValidateStep;
