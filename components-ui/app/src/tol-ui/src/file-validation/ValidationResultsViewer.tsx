/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router";
import ValidateSteps from "./ValidateSteps";
import { Widgets, TsDataSource, LoadingContent, Icon } from "../index";
import {
  getErrorWarningCounts,
  fetchAndNormaliseUploadResult,
  downloadItem,
  determineUploadStatus,
  IUploadStatus,
  IErrorWarningCount,
} from "./utils";
import { IPipelineUpload } from "./utils";

interface Props {
  endpoint: string;
}

function ValidationResultsViewer(props: Props) {
  const { endpoint } = props;
  const { uploadId } = useParams<{ uploadId: string }>();

  const ds = new TsDataSource();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const stepName = searchParams.get("stepName") || undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [pipelineResult, setPipelineResult] = useState<IPipelineUpload | null>(
    null
  );
  const [errorAndWarningCount, setErrorAndWarningCount] =
    useState<IErrorWarningCount>({ errors: 0, warnings: 0 });
  const [uploadStatus, setUploadStatus] = useState<IUploadStatus>({
    className: "",
    text: "",
  });

  useEffect(() => {
    fetchAndNormaliseUploadResult(
      ds,
      endpoint,
      uploadId,
      setPipelineResult,
      setHasErrors,
      setLoading
    );
  }, [uploadId]);

  useEffect(() => {
    if (pipelineResult) {
      const counts = getErrorWarningCounts(pipelineResult!.validationResults);
      setErrorAndWarningCount(counts);

      setUploadStatus(
        determineUploadStatus(
          pipelineResult.completed,
          counts.errors,
          counts.warnings,
          pipelineResult.failureMessage || null
        )
      );
    }
  }, [pipelineResult]);

  const Results = (
    <div className="tol-file-validation-results-page-container">
      <div>
        {pipelineResult && (
          <>
            <div className="tol-file-validation-results-page-info-container">
              <div className="tol-file-validation-results-page-info-inner-container">
                <h4>Results for Pipeline # {pipelineResult.id}</h4>
                <h6>Pipeline: {pipelineResult.pipelineName}</h6>
              </div>
              <div>
                <h4
                  className={`tol-file-validation-previous-results-results-status ${uploadStatus.className}`}
                >
                  {uploadStatus.text}
                </h4>
                <p className="tol-file-validation-results-page-info-date">
                  {new Date(pipelineResult.dateStarted).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="tol-file-validation-results-page-additional-info">
              <div>
                <h6>Flow ID: {pipelineResult.flowRunId}</h6>
                <p>
                  {"Download File: "}
                  <a
                    href="#"
                    onClick={() => downloadItem(pipelineResult.s3Filename)}
                  >
                    {pipelineResult.s3Filename}
                  </a>
                </p>
              </div>
              <div className="tol-file-validation-results-page-error-count-container">
                <p>Number of Warnings: {errorAndWarningCount.warnings}</p>
                <p>Number of Errors: {errorAndWarningCount.errors}</p>
              </div>
            </div>
          </>
        )}
      </div>
      {pipelineResult?.validationResults && (
        <ValidateSteps
          data={pipelineResult.validationResults}
          expandedIndex={stepName}
        />
      )}
    </div>
  );

  const Errors = (
    <div className="tol-file-validation-error-info">
      <span className="tol-file-validation-error-icon">
        <Icon icon="xmark" size="lg" />
      </span>
      <h6>Failed to fetch results, please try again.</h6>
    </div>
  );

  const ResultsViewer = [
    {
      component: !hasErrors ? Results : Errors,
      type: "full",
    },
  ];

  return loading && !pipelineResult ? (
    <LoadingContent text="Loading Results" />
  ) : (
    <Widgets components={ResultsViewer} />
  );
}

export default ValidationResultsViewer;
