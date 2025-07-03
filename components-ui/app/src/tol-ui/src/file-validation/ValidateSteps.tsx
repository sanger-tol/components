/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useCallback, useEffect } from "react";
import ValidateStep from "./ValidateStep";
import ErrorViewer from "./ErrorViewer";
import { resizeListener } from "../hooks";
import { getStepsInResults, IValidationResult } from "./utils";

interface IStepsCount {
  validationSteps: number;
  conversionSteps: number;
  totalSteps: number;
}

interface Props {
  data: IValidationResult[];
  stepsCount?: IStepsCount;
  expandedIndex?: string;
}

//TODO: Add progress bar
//TODO: Get the number of steps from the pipeline_steps db, or config?

const WIDTH_REDUCER = 40;

function ValidateSteps(props: Props) {
  const { data, stepsCount } = props;
  const [expandedIndex, setExpandedIndex] = useState<string | null>(
    props.expandedIndex || null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stepsInResults, setStepsInResults] = useState<string[]>([]);

  useEffect(() => {
    setStepsInResults(getStepsInResults(data));
  }, [data]);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setContainerWidth(containerRef.current.clientWidth - WIDTH_REDUCER);
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, [stepsInResults]);

  resizeListener(handleResize);

  const handleToggleExpanded = useCallback((stepName: string) => {
    setExpandedIndex((prev) => (prev === stepName ? null : stepName));
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
          {stepsInResults.map((stepName, index) => {
            const stepData = data.filter(
              (result) => result.stepName === stepName
            );
            return (
              <ValidateStep
                key={stepName}
                id={`step-${index}`}
                stepName={stepName}
                errors={stepData}
                expanded={expandedIndex === stepName}
                onSeeAllErrors={() => handleToggleExpanded(stepName)}
              />
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
              {data.map((result, index) => {
                if (result.stepName === expandedIndex) {
                  return (
                    <ErrorViewer
                      key={`error-${index}-${result.stepName}`}
                      errorType={result.severity}
                      message={result.detail}
                      stepName={result.stepName}
                      cellId={{
                        column: result.field ?? "all",
                        row: result.objectId ?? "",
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
