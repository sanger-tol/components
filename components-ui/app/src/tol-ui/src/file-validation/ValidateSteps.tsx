/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useRef, useCallback, useEffect } from "react";
import ValidateStep from "./ValidateStep";
import ErrorViewer from "./ErrorViewer";
import { resizeListener } from "../hooks";
import { IValidationResult } from "./utils";

interface Props {
  data: IValidationResult[];
  steps: string[];
  expandedIndex?: string;
  stepName?: string;
  targetRef?: React.RefObject<HTMLDivElement | null>;
  completed?: boolean;
}

const WIDTH_REDUCER = 40;

function ValidateSteps(props: Props) {
  const { data, steps } = props;
  const [expandedIndex, setExpandedIndex] = useState<string | null>(
    props.expandedIndex || null
  );
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setContainerWidth(containerRef.current.clientWidth - WIDTH_REDUCER);
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, [steps]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  resizeListener(handleResize);

  const handleToggleExpanded = useCallback((stepName: string) => {
    setExpandedIndex((prev: string) => (prev === stepName ? null : stepName));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tol-file-validation-scrollbar-fix tol-file-uploader-validate-steps-outer-container ${
        expandedIndex !== null && isOverflowing ? " expanded" : ""
      }`}
    >
      <div>
        <div className="tol-file-uploader-validate-steps-inner-container">
          {steps.map((stepName: string) => {
            const stepData = data.filter(
              (result) => result.stepName === stepName
            );
            return (
              <div
                key={stepName}
                ref={props.stepName === stepName ? props.targetRef : null}
              >
                <ValidateStep
                  id={`${stepName}`}
                  stepName={stepName}
                  results={stepData}
                  expanded={expandedIndex === stepName}
                  onSeeAllErrors={() => handleToggleExpanded(stepName)}
                />
              </div>
            );
          })}
        </div>
        {expandedIndex !== null && (
          <div
            className={`tol-file-validation-scrollbar-fix
              tol-validate-steps-all-errors-animation 
              tol-validate-step-expanded-all-errors-container ${
                !isOverflowing ? "full-width" : ""
              }`}
            style={{
              maxWidth:
                containerWidth > WIDTH_REDUCER ? containerWidth : "100%",
            }}
          >
            <div
              key={expandedIndex}
              className="tol-validate-steps-all-errors-animation"
            >
              <h6>All errors and warnings for {expandedIndex}:</h6>
              {data.map((result: IValidationResult, index: number) => {
                if (result.stepName === expandedIndex) {
                  return (
                    <ErrorViewer
                      key={`error-${index}-${result.stepName}`}
                      errorType={result.severity}
                      message={result.detail}
                      stepName={result.stepName}
                      cellId={{
                        column: result.field
                          ? Array.isArray(result.field)
                            ? result.field.join(", ")
                            : result.field
                          : "all",
                        row: result.objectId || "N/A",
                      }}
                    />
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidateSteps;
