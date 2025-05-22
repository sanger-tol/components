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
const errorValues = ["Error 1", "Error 2", "Error 3", "Error 4", "Error 5"];

function ValidateStep(props: Props) {
  const { id, stepName, onSeeAllErrors, icon = "xmark", expanded } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        id={id}
        style={{
          background: "var(--tol-success)",
          height: "fit-content",
          width: "250px",
          padding: "5px 15px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 0px",
          }}
        >
          <h6
            style={{
              alignSelf: "center",
              marginBottom: "0px",
            }}
          >
            Validate {stepName}
          </h6>
          <ValidationIcon
            iconType={errors ? "xmark" : "check"}
            size="lg"
            style={{
              border: "2px solid white",
              backgroundColor: errors
                ? "var(--tol-danger)"
                : "var(--tol-success)",
              borderRadius: "100%",
              padding: "10px 12px 10px 12px",
            }}
          />
        </div>
        {errors ? (
          <>
            <p style={{ fontSize: "12px", marginBottom: "0px" }}>
              {errorValues.length} Errors:
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
            {errorValues.length > 2 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={onSeeAllErrors}
              >
                <p style={{ margin: "4px" }}>See All...</p>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              minHeight: "fit-content",
              marginTop: "10px",
            }}
          >
            <p>{vOrC} Passed 🎉</p>
          </div>
        )}
      </div>
      {expanded && <div className="tol-file-upload-step-triangle" />}
    </div>
  );
}

export default ValidateStep;
