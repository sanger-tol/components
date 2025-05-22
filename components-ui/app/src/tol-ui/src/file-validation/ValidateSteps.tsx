/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect } from "react";
import ValidateStep from "./ValidateStep";
import ErrorViewer from "./ErrorViewer";
import { resizeListener } from "src/hooks";

//TODO: Add progress bar

// TEST DATA
const steps = [
  { id: "step1", stepName: "Step 1" },
  { id: "step2", stepName: "Step 2" },
  { id: "step3", stepName: "Step 3" },
  { id: "step4", stepName: "Step 4" },
  { id: "step5", stepName: "Step 5" },
  { id: "step6", stepName: "Step 6" },
  { id: "step7", stepName: "Step 7" },
  { id: "step8", stepName: "Step 8" },
];

const allErrors = [
  ["Error 1a", "Error 1b", "Error 1c"],
  ["Error 2a", "Error 2b", "Error 2c"],
  ["Error 3a", "Error 3b", "Error 3c", "Error 3d", "Error 3e"],
  // ["Error 3a", "Error 3b", "Error 3c"],
  // ["Error 3a", "Error 3b", "Error 3c"],
  // ["Error 3a", "Error 3b", "Error 3c"],
  // ["Error 3a", "Error 3b", "Error 3c"],
  // ["Error 3a", "Error 3b", "Error 3c"],
];

function ValidateSteps() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(1);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(expandedIndex);
  }, [expandedIndex]);

  resizeListener(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth - 40);
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  });

  return (
    <div
      ref={containerRef}
      className={`tol-file-uploader-validate-steps-outer-container ${
        expandedIndex !== null && isOverflowing ? " expanded" : ""
      }`}
    >
      <div>
        <div className="tol-file-uploader-validate-steps-inner-container">
          {steps.map((step, index) => (
            <ValidateStep
              key={step.id}
              id={step.id}
              stepName={step.stepName}
              errorValues={allErrors[index]}
              expanded={expandedIndex === index}
              onSeeAllErrors={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            />
          ))}
        </div>
        {expandedIndex !== null && (
          <div
            className={`tol-validate-steps-all-errors-animation tol-validate-step-expanded-all-errors-container ${
              !isOverflowing ? "full-width" : ""
            }`}
            style={{ maxWidth: containerWidth ? containerWidth : "100%" }}
          >
            <div
              key={expandedIndex}
              className="tol-validate-steps-all-errors-animation"
            >
              <h6>All errors for {steps[expandedIndex].stepName}:</h6>
              {allErrors[expandedIndex].map((err, i) => (
                <div key={i}>
                  <ErrorViewer message={err} stepName={steps[expandedIndex].stepName}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidateSteps;
