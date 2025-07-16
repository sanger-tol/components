/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Widgets, TsDataSource, LoadingContent, Icon, Button } from "../index";
import {
  getErrorWarningCounts,
  downloadItem,
  determineUploadStatus,
  IUploadStatus,
  IErrorWarningCount,
  fetchCurrentPipelineResults,
  REFRESH_INTERVAL,
  ValidateSteps,
  IPipelineUpload,
  PreviousUploadsModal,
} from "./index";
import { VALIDATION_ENDPOINTS } from "../constants";

function ValidationResultsViewer() {
  const { uploadId } = useParams<{ uploadId: string }>();

  const ds = new TsDataSource();
  const location = useLocation();
  const history = useHistory();
  const targetRef = useRef<HTMLDivElement | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const stepName = searchParams.get("stepName") || undefined;

  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errorAndWarningCount, setErrorAndWarningCount] =
    useState<IErrorWarningCount>({ errors: 0, warnings: 0 });
  const [uploadStatus, setUploadStatus] = useState<IUploadStatus>({
    className: "",
    text: "",
  });
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [validating, setValidating] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);

  const fetchLatestPipelineResults = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cache_bust=${Date.now()}`;
    if (!uploadId) {
      return null;
    }
    const result = await fetchCurrentPipelineResults(
      ds,
      cacheBustedEndpoint,
      uploadId
    );

    if (!result) {
      setHasErrors(true);
      return null;
    }
    return result;
  };

  const {
    data: latestPipelineResults = {} as IPipelineUpload | null,
    refetch: refetchLatestPipelineResults,
    dataUpdatedAt: latestResultsUpdatedAt,
    isLoading,
  } = useQuery({
    queryKey: ["latestPipelineResults", uploadId],
    queryFn: fetchLatestPipelineResults,
    enabled: !hasErrors && uploadId !== null && !validated,
    refetchInterval: (data: any) => {
      return data && !data.completed ? REFRESH_INTERVAL / 2 : false;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!latestPipelineResults || !uploadId) return;

    if (!latestPipelineResults.completed && !validating) {
      setValidating(true);
      setValidated(false);
    } else if (latestPipelineResults.completed && validating) {
      setValidating(false);
      setValidated(true);
    }
  }, [latestPipelineResults, uploadId, validating]);

  useEffect(() => {
    if (latestPipelineResults && latestPipelineResults.validationResults) {
      const counts = getErrorWarningCounts(
        latestPipelineResults.validationResults
      );
      setErrorAndWarningCount(counts);

      setUploadStatus(
        determineUploadStatus(
          latestPipelineResults.completed,
          counts.errors,
          counts.warnings,
          latestPipelineResults.failureMessage || null
        )
      );
    }

    if (stepName !== undefined && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      searchParams.delete("stepName");
      history.replace({
        search: searchParams.toString(),
      });
    }
  }, [latestPipelineResults, stepName]);

  const Results = (
    <div className="tol-file-validation-results-page-container">
      <div>
        {latestPipelineResults && (
          <>
            <div className="tol-file-validation-results-page-info-container">
              <div className="tol-file-validation-results-page-info-inner-container">
                <h4>Results for Pipeline #{latestPipelineResults.id}</h4>
                <h6>Pipeline: {latestPipelineResults.pipelineName}</h6>
              </div>
              <div>
                <h4
                  className={`tol-file-validation-previous-results-results-status ${uploadStatus.className}`}
                >
                  {uploadStatus.text}
                </h4>
                <p className="tol-file-validation-results-page-info-date">
                  {new Date(latestPipelineResults.dateStarted).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="tol-file-validation-results-page-additional-info">
              <div>
                <h6>Flow ID: {latestPipelineResults.flowRunId}</h6>
                <p>
                  {"Download File: "}
                  <a
                    href="#"
                    onClick={() =>
                      downloadItem(latestPipelineResults.s3Filename)
                    }
                  >
                    {latestPipelineResults.s3Filename}
                  </a>
                </p>
                <p className="tol-file-validation-results-page-additional-info-updated-at">
                  Updated At:{" "}
                  {new Date(latestResultsUpdatedAt).toLocaleString()}
                </p>
              </div>
              <div className="tol-file-validation-results-page-error-count-container">
                <p>Number of Warnings: {errorAndWarningCount.warnings}</p>
                <p>Number of Errors: {errorAndWarningCount.errors}</p>
                <span className="tol-file-validation-results-page-error-count-button">
                  <Button
                    icon="rotate"
                    tooltip="Refresh"
                    disabled={latestPipelineResults?.completed}
                    onClick={() => refetchLatestPipelineResults()}
                    timeout={3000}
                  />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {latestPipelineResults?.validationResults && (
        <ValidateSteps
          data={latestPipelineResults.validationResults}
          expandedIndex={stepName}
          steps={latestPipelineResults.pipelineSteps}
          stepName={stepName}
          targetRef={targetRef}
          completed={latestPipelineResults.completed}
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

  const Title = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3 style={{ margin: 0 }}>Previous Validation Results</h3>
      <Button text="View All" onClick={() => setOpenModal(true)} />
    </div>
  );

  const ResultsViewer = [
    {
      component: Title,
      type: "full",
    },
    {
      component: !hasErrors ? Results : Errors,
      type: "full",
    },
  ];

  return isLoading && !latestPipelineResults ? (
    <LoadingContent text="Loading Results" />
  ) : (
    <>
      <PreviousUploadsModal openModal={openModal} setOpenModal={setOpenModal} />
      <Widgets components={ResultsViewer} />
    </>
  );
}

export default ValidationResultsViewer;
