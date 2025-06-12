/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useCallback } from "react";
import ValidateStep from "./ValidateStep";
import ErrorViewer from "./ErrorViewer";
import { resizeListener } from "../hooks";
import { determineStepHasErrors, Step } from "./utils";

interface Props {
  data: Step[];
}

//TODO: Add progress bar

const WIDTH_REDUCER = 20;

function ValidateSteps(props: Props) {
  const { data } = props;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setContainerWidth(containerRef.current.clientWidth - WIDTH_REDUCER);
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, []);

  resizeListener(handleResize);

  const handleToggleExpanded = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

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
              onSeeAllErrors={() => handleToggleExpanded(index)}
            />
          ))}
        </div>
        {expandedIndex !== null && (
          <div
            className={`tol-validate-steps-all-errors-animation tol-validate-step-expanded-all-errors-container ${
              !isOverflowing ? "full-width" : ""
            }`}
            style={{ maxWidth: containerWidth || "100%" }}
          >
            <div
              key={expandedIndex}
              className="tol-validate-steps-all-errors-animation"
            >
              <h6>All errors for {data[expandedIndex].stepName}:</h6>
              {determineStepHasErrors(data[expandedIndex]) &&
                data[expandedIndex].errors?.map((error, index) => (
                  <ErrorViewer
                    key={`error-${index}`}
                    message={error}
                    stepName={data[expandedIndex].stepName}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidateSteps;
