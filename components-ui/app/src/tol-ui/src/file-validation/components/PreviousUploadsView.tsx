/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { useHistory } from "react-router-dom";

import {
  ValidationIcon,
  getErrorWarningCounts,
  determineStepStatus,
  downloadFileFromS3,
  goToResults,
  Button,
  HoverOverlay,
  IconTooltip,
  normaliseCaps,
  truncateString,
  PIPELINE_DS,
  splitS3FilenameString,
  useValidationPolicyModule,
} from "../..";

import type { IStepData, IAllValidationData, IValidationResult } from "../..";

export interface PPreviousUploadsView {
  /**
   * Id of the upload, used for routing to results page and as a key for the component
   */
  id: string;
  /**
   * Data associated with the upload
   */
  data: IAllValidationData;
  /**
   * Whether the upload view is expanded
   */
  expanded: boolean;
  /**
   * Callback to toggle the expanded state
   */
  onToggle: (id: string) => void;
  /**
   * Optional whether to show passed steps
   */
  showPassedSteps?: boolean;
  /**
   * Optional has validation completed, used to show particular statuses
   */
  completed?: boolean;
  /**
   * Optional callback to set the open modal state
   */
  setOpenModal?: (open: boolean) => void;
}

export function PreviousUploadsView(props: PPreviousUploadsView) {
  const {
    id,
    data,
    expanded,
    onToggle,
    showPassedSteps,
    completed,
    setOpenModal,
  } = props;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const history = useHistory();
  const { policies } = useValidationPolicyModule();

  const uploadStatus = policies[data.validationStatus];

  const ValidationIconTooltip = (
    errorCount: number,
    warningCount: number,
    stepName: string,
  ) => {
    const hasIssues = errorCount > 0 || warningCount > 0;
    const totalIssues = errorCount + warningCount;
    return (
      <span className="tol-file-validation-previous-results-icon-tooltip">
        <p>{normaliseCaps(stepName)}</p>
        {!completed && !data.failureMessage && <p>Running Pipeline</p>}
        <p>
          {data.failureMessage
            ? "Pipeline Failed..."
            : hasIssues
              ? `${errorCount} Errors, ${warningCount} Warnings`
              : completed
                ? "Passed - No Issues"
                : "No issues found yet..."}
        </p>
        <a
          href="#"
          onClick={() => {
            goToResults(history, id, stepName, totalIssues);
            if (setOpenModal) setOpenModal(false);
          }}
        >
          {hasIssues && completed && !data.failureMessage && <p>Go to</p>}
        </a>
      </span>
    );
  };

  return (
    <div className="tol-file-validation-previous-results-container">
      <div className="tol-file-validation-previous-results-title">
        <h6 className="tol-file-validation-previous-results-title-text">
          #{id} - {data.uploadName}
        </h6>
        <div className="tol-file-validation-previous-results-date-container">
          <p className="tol-file-validation-previous-results-date-text">
            {new Date(data.dateStarted).toLocaleString()}
          </p>
          <Button
            icon="chevron-down"
            onClick={() => onToggle(id)}
            className={`
                tol-file-uploader-previous-validations-dropdown-btn ${
                  expanded ? "icon-rotate" : ""
                }`}
            tooltip={expanded ? "Collapse" : "Expand"}
          />
        </div>
      </div>
      <div className="tol-file-validation-previous-results-status-container">
        <a
          href="#"
          onClick={() =>
            downloadFileFromS3(PIPELINE_DS, data.s3Bucket, data.s3Filename)
          }
        >
          <p>
            {
              <HoverOverlay contents={"download"}>
                {splitS3FilenameString(String(data.s3Filename))}
              </HoverOverlay>
            }
          </p>
        </a>
        <div className="tol-file-validation-previous-results-failure-info">
          <div className="tol-file-validation-results-status-container">
            <h6
              className={"tol-file-validation-results-status"}
              style={{ color: `${uploadStatus.textColor}` }}
            >
              {`${uploadStatus.rename}`}
            </h6>
            <IconTooltip contents={uploadStatus.summary} disableMarkdown />
          </div>
          {uploadStatus.isFailureStatus && (
            <IconTooltip
              contents={`Reason: ${truncateString(data.failureMessage || "")}`}
              disableMarkdown
            />
          )}
        </div>
      </div>
      <div
        className={`tol-file-uploader-previous-validation-results-container ${
          expanded ? "expanded" : ""
        }`}
      >
        <div className="tol-file-validation-previous-results-show-results-container">
          <div className="tol-file-validation-previous-results-show-title">
            <h6>Results:</h6>
            <p>
              Pipeline: {data.pipelineName}
            </p>
          </div>
          <div className="tol-file-validation-previous-results-show-results-inner">
            <div
              className="tol-file-validation-scrollbar-fix 
            tol-file-validation-previous-results-icon-container"
            >
              {data.pipelineSteps.length > 0 ? (
                (() => {
                  const uniqueSteps = Array.from(new Set(data.pipelineSteps));
                  const allStepsPassed = uniqueSteps.every((step) => {
                    const stepResults = data.validationResults.filter(
                      (result: IValidationResult) =>
                        result.stepName === step.name,
                    );
                    const issueCount = getErrorWarningCounts(stepResults);
                    return issueCount.errors === 0 && issueCount.warnings === 0;
                  });

                  return uniqueSteps
                    .filter((step: IStepData) => {
                      if (allStepsPassed) return true;
                      if (showPassedSteps) return true;
                      const stepResults = data.validationResults.filter(
                        (result: IValidationResult) =>
                          result.stepName === step.name,
                      );
                      const issueCount = getErrorWarningCounts(stepResults);
                      return issueCount.errors > 0 || issueCount.warnings > 0;
                    })
                    .map((step: IStepData, index: number) => {
                      const stepResults = data.validationResults.filter(
                        (result: IValidationResult) =>
                          result.stepName === step.name,
                      );
                      const issueCount = getErrorWarningCounts(stepResults);
                      const iconType = data.failureMessage
                        ? "question"
                        : issueCount.errors > 0
                          ? "xmark"
                          : issueCount.warnings > 0
                            ? "exclamation"
                            : "check";
                      const stepStatus = determineStepStatus(issueCount);
                      return (
                        <div
                          key={`${step.name}-${index}`}
                          onClick={() => {
                            setExpandedId(
                              expandedId === step.name ? null : step.name,
                            );
                          }}
                        >
                          <div className="tol-file-validation-previous-results-icon-inner-container">
                            <ValidationIcon
                              tooltip={ValidationIconTooltip(
                                issueCount.errors,
                                issueCount.warnings,
                                step.name,
                              )}
                              iconType={iconType}
                              size="lg"
                              className={`tol-file-uploader-validate-step-icon ${
                                completed ? stepStatus.className : "in-progress"
                              }`}
                              completed={completed}
                              completedCheck={true}
                              failed={!!data.failureMessage}
                            />
                          </div>
                        </div>
                      );
                    });
                })()
              ) : (
                <h6 className="tol-file-validation-previous-results-no-data">
                  No pipeline steps found.
                </h6>
              )}
            </div>
            <div>
              <Button
                text="View Results"
                onClick={() => {
                  if (setOpenModal) setOpenModal(false);
                  goToResults(history, id);
                }}
              />
            </div>
          </div>
          {data.failureMessage && (
            <p>
              Failure reason: <span>{truncateString(data.failureMessage)}</span>
            </p>
          )}
          {data.rejectionReason && (
            <p>
              Rejection reason:{" "}
              <span>{truncateString(data.rejectionReason)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
