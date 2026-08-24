/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useRef, useCallback } from "react";
import {
  ValidateStep,
  ErrorViewer,
  componentResizeListener,
  IValidationResult,
  WIDTH_REDUCER,
  IStepData,
  TStepsData,
} from "../..";

export interface PValidateSteps {
  /**
   * Data for all validation results, used to pull out the errors/warnings for each 
   * step and display in the expanded view
   */
  data: IValidationResult[];
  /**
   * Data for the steps, used to display the step name and description
   */
  steps: TStepsData;
  /**
   * Optional index to scroll into view and expand on load, used for 
   * linking from the error viewer to the relevant step
   */
  expandedIndex?: string;
  /**
   * Optional step name to scroll into view when expandedIndex is provided, 
   * used for linking from the error viewer to the relevant step
   */
  stepName?: string;
  /**
   * Optional ref to scroll into view when expandedIndex is provided, used for 
   * linking from the error viewer to the relevant step
   */
  targetRef?: React.RefObject<HTMLDivElement>;
  /**
   * Optional whether validation has completed, used to determine whether to show the option to 
   * see all errors/warnings and show particular messages in the expanded view
   */
  completed?: boolean;
  /**
   * Optional failure message from the validation details, 
   * used to show in the expanded view if validation has failed without any 
   * specific errors (e.g. a pipeline step has failed without returning any specific error messages)
   */
  failureMessage?: string | null;
}

/**
 * Validate steps component. Takes upload data and renders a selection single
 * ValidateSteps components, along with containing resize and expansion logic.
 */
export function ValidateSteps(props: PValidateSteps) {
  const { data, steps, completed, failureMessage } = props;

  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(
    props.expandedIndex || null,
  );

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setContainerWidth(containerRef.current.clientWidth - WIDTH_REDUCER);
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, [steps]);

  componentResizeListener(containerRef, handleResize);

  const handleToggleExpanded = useCallback((stepName: string) => {
    setExpandedIndex((prev: string) => (prev === stepName ? null : stepName));
  }, []);

  return (
    <div
      ref={containerRef}
      className={`tol-file-validation-scrollbar-fix 
        tol-file-uploader-validate-steps-outer-container ${
          expandedIndex !== null && isOverflowing ? " expanded" : ""
        } ${steps.length < 4 ? " few-steps" : ""}`}
    >
      <div>
        <div className="tol-file-uploader-validate-steps-inner-container">
          {steps.length > 0 ? (
            steps.map((step: IStepData) => {
              const stepData = data.filter(
                (result: IValidationResult) => result.stepName === step.name,
              );
              return (
                <div
                  key={step.name}
                  ref={props.stepName === step.name ? props.targetRef : null}
                >
                  <ValidateStep
                    id={`${step.name}`}
                    stepDetails={{
                      stepName: step.name,
                      results: stepData,
                      description: step.description,
                      validationDetails: {
                        completed: completed || false,
                        failureMessage: failureMessage,
                      },
                    }}
                    expanded={expandedIndex === step.name}
                    onSeeAllErrors={() => handleToggleExpanded(step.name)}
                  />
                </div>
              );
            })
          ) : (
            <h6 className="tol-file-validation-previous-results-no-data">
              No pipeline steps found.
            </h6>
          )}
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
              {data
                .sort((a: IValidationResult, b: IValidationResult) => {
                  if (a.severity !== b.severity) {
                    return a.severity === "error" ? -1 : 1;
                  }
                  return Number(a.objectId) - Number(b.objectId);
                })
                .map((result: IValidationResult, index: number) => {
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
