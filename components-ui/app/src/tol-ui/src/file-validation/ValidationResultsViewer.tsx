/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useParams } from "react-router";
import {
  getErrorWarningCounts,
  downloadFileFromS3,
  determineUploadStatus,
  IUploadStatus,
  IErrorWarningCount,
  fetchCurrentPipelineResults,
  ValidateSteps,
  IPipelineUpload,
  PreviousUploadsModal,
  Widgets,
  LoadingContent,
  Icon,
  Button,
  VALIDATION_ENDPOINTS,
  BUTTON_TIMEOUT,
  PIPELINE_DS,
  ValidationReport,
  splitS3FilenameString,
  useQueryData,
  markFileAsReady,
} from "..";

export function ValidationResultsViewer() {
  const { uploadId } = useParams<{ uploadId: string }>();

  const location = useLocation();
  const history = useHistory();
  const targetRef = useRef<HTMLDivElement | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const stepName = searchParams.get("stepName") || undefined;

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [failedPipeline, setFailedPipeline] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [errorAndWarningCount, setErrorAndWarningCount] =
    useState<IErrorWarningCount>({ errors: 0, warnings: 0 });
  const [uploadStatus, setUploadStatus] = useState<IUploadStatus>({
    className: "",
    text: "",
  });

  const fetchLatestPipelineResults = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cb=${Date.now()}`;
    if (!uploadId) {
      return null;
    }
    const result = await fetchCurrentPipelineResults(
      PIPELINE_DS,
      cacheBustedEndpoint,
      uploadId
    );

    if (result?.failureMessage) {
      setFailedPipeline(true);
    }

    if (!result) {
      setHasErrors(true);
      return null;
    }
    return result;
  };

  const latestPipelineResults = useQueryData<IPipelineUpload | null>(
    ["latestPipelineResults", uploadId],
    fetchLatestPipelineResults,
    {
      enabled: true,
      refetchBackoff: {
        enabled: true,
        options: {
          stopCondition: !validating || validated || failedPipeline,
          limit: 15,
        },
      },
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (!latestPipelineResults.data || !uploadId) return;

    if (!latestPipelineResults.data.completed && !validating) {
      setValidating(true);
      setValidated(false);
    } else if (latestPipelineResults.data.completed && validating) {
      setValidating(false);
      setValidated(true);
    }
  }, [latestPipelineResults.data, uploadId, validating]);

  useEffect(() => {
    if (
      latestPipelineResults.data &&
      latestPipelineResults.data.validationResults
    ) {
      const counts = getErrorWarningCounts(
        latestPipelineResults.data.validationResults
      );
      setErrorAndWarningCount(counts);

      setUploadStatus(
        determineUploadStatus(
          latestPipelineResults.data.completed,
          counts.errors,
          counts.warnings,
          latestPipelineResults.data.failureMessage || null,
          latestPipelineResults.data.isReady
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
  }, [latestPipelineResults.data, stepName]);

  const onMarkAsReadyClick = () => {
    markFileAsReady(
      uploadId!,
      () => setUploadStatus({
        className: "marked-as-ready",
        text: "Marked as Ready",
      })
    )
  }

  const Results = (
    <div className="tol-file-validation-results-page-container">
      <div>
        {latestPipelineResults && (
          <>
            <div className="tol-file-validation-results-page-info-container">
              <div className="tol-file-validation-results-page-info-inner-container">
                <h4>Results for Pipeline #{latestPipelineResults.data.id}</h4>
                <h6>Pipeline: {latestPipelineResults.data.pipeline}</h6>
              </div>
              <div>
                <h4
                  className={`tol-file-validation-results-status ${uploadStatus.className}`}
                >
                  {uploadStatus.text}
                </h4>
                <p className="tol-file-validation-results-page-info-date">
                  {new Date(
                    latestPipelineResults.data.dateStarted
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="tol-file-validation-results-page-additional-info">
              <div>
                <h6>Flow ID: {latestPipelineResults.data.flowRunId}</h6>
                <p>
                  {"Download File: "}
                  <a
                    href="#"
                    onClick={() =>
                      downloadFileFromS3(
                        PIPELINE_DS,
                        latestPipelineResults.data.s3Bucket,
                        latestPipelineResults.data.s3Filename
                      )
                    }
                  >
                    {splitS3FilenameString(
                      String(latestPipelineResults.data.s3Filename)
                    )}
                  </a>
                </p>
                <p className="tol-file-validation-results-page-additional-info-updated-at">
                  Updated At:{" "}
                  {new Date(
                    latestPipelineResults.dataUpdatedAt
                  ).toLocaleString()}
                </p>
              </div>
              <div className="tol-file-validation-results-page-error-count-container">
                <p>Number of Warnings: {errorAndWarningCount.warnings}</p>
                <p>Number of Errors: {errorAndWarningCount.errors}</p>
                <span className="tol-file-validation-results-page-error-count-button">
                  <Button
                    icon="clipboard"
                    tooltip="Show Report"
                    onClick={() => setReportOpen((prev: boolean) => !prev)}
                  />
                  <Button
                    icon="rotate"
                    tooltip="Refresh"
                    disabled={latestPipelineResults?.data.completed}
                    onClick={() => latestPipelineResults.refetch()}
                    timeout={BUTTON_TIMEOUT}
                  />
                  {latestPipelineResults?.data.completed && uploadStatus.text !== "Marked as Ready" && (
                    <Button
                      type="success"
                      text="Mark As Ready"
                      onClick={onMarkAsReadyClick}
                    />
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {latestPipelineResults?.data.validationResults && (
        <ValidateSteps
          data={latestPipelineResults.data.validationResults}
          expandedIndex={stepName}
          steps={latestPipelineResults.data.pipelineSteps}
          stepName={stepName}
          targetRef={targetRef}
          completed={latestPipelineResults.data.completed}
          failureMessage={latestPipelineResults.data.failureMessage}
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
    <div className="tol-file-validation-results-viewer-title-container">
      <h3>Previous Validation Results</h3>
      <div className="tol-file-validation-results-viewer-title-buttons">
        <Button text="View All" onClick={() => setOpenModal(true)} />
        <Button
          text="Back"
          icon="arrow-left"
          onClick={() => history.goBack()}
        />
      </div>
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

  return latestPipelineResults.isLoading && !latestPipelineResults ? (
    <LoadingContent text="Loading Results" />
  ) : (
    <>
      <ValidationReport
        data={latestPipelineResults.data}
        open={reportOpen}
        setOpen={setReportOpen}
        uploadStatus={uploadStatus.text}
      />
      <PreviousUploadsModal
        openModal={openModal}
        setOpenModal={(open) => setOpenModal(Boolean(open))}
      />
      <Widgets components={ResultsViewer} />
    </>
  );
}
