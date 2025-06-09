/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from "react";
import ValidateStep from "./ValidateStep";
import ErrorViewer from "./ErrorViewer";
import { resizeListener } from "src/hooks";

interface Props {
  data: any[];
}

//TODO: Add progress bar

// TEST DATA

const WIDTH_REDUCER = 20;

function ValidateSteps(props: Props) {
  const {data} = props;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  resizeListener(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth - WIDTH_REDUCER);
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
          {data.map((step, index) => (
            <ValidateStep
              key={step.id}
              id={step.id}
              stepName={step.stepName}
              errorValues={step.errors}
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
              <h6>All errors for {data[expandedIndex].stepName}:</h6>
              {data.map((step) =>
                step.errors.length > 0 && step.id === data[expandedIndex].id ? (
                  <div key={step.id}>
                    {step.errors.map((error, index) => (
                      <ErrorViewer
                        key={`${step.id}-error-${index}`}
                        message={error}
                        stepName={step.stepName}
                      />
                    ))}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidateSteps;
