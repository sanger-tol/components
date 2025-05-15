/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import ValidateStep from "./ValidateStep";

//TODO: Add progress bar

const steps = [
  { id: "step1", stepName: "Step 1" },
  { id: "step2", stepName: "Step 2" },
  { id: "step3", stepName: "Step 3" },
];

const allErrors = [
  ["Error 1a", "Error 1b", "Error 1c"],
  ["Error 2a", "Error 2b", "Error 2c"],
  ["Error 3a", "Error 3b", "Error 3c"],
];

function ValidateSteps() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        justifySelf: "center",
        background: "var(--tol-grey-subtle)",
        width: "fit-content",
        padding: "20px",
      }}
    >
      <div>
        <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
          {steps.map((step, index) => (
            <ValidateStep
              key={step.id}
              id={step.id}
              stepName={step.stepName}
              errorValues={allErrors[index]}
              expanded={expandedIndex === index}
              onSeeAllErrors={() => (
                setExpandedIndex(expandedIndex === index ? null : index)
              )}
            />
          ))}
        </div>
        {expandedIndex !== null && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "6px",
              marginTop: "8px",
              padding: "16px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <strong>All errors for {steps[expandedIndex].stepName}</strong>
            <ul>
              {allErrors[expandedIndex].map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidateSteps;
