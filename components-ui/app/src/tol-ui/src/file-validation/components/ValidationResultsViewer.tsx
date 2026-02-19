/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";

import {
  getErrorWarningCounts,
  fetchCurrentPipelineResults,
  ValidateSteps,
  PreviousUploadsModal,
  Widgets,
  LoadingContent,
  Icon,
  Button,
  VALIDATION_ENDPOINTS,
  BUTTON_TIMEOUT,
  PIPELINE_DS,
  ValidationReport,
  useQueryData,
  useTimeout,
  VALIDATION_TIMEOUT_MS,
  getUserFromLocalStorage,
  setValidationTimeout,
  DropdownButtons,
  useValidationPolicyModule,
  SubmissionRejectModal,
  IconTooltip,
} from "../..";

import type {
  IAllValidationData,
  IErrorWarningCount,
  TFileValidationStatus,
  TFileValidationStatusPolicy,
  TFileValidationAction,
  TFileValidationActionId,
} from "../..";

export function ValidationResultsViewer() {
  // Captures upload id passed to the page parameters
  // /file-validation/results/<uploadId>
  const { uploadId } = useParams<{ uploadId: string }>();

  // Get the actions and policies from the module, which has been set by the provider
  const { actions, policies } = useValidationPolicyModule();

  const location = useLocation();
  const history = useHistory();
  const queryClient = useQueryClient();

  // Captures which (if any) step name needs to be expanded and scrolled to (horizontally)
  const searchParams = new URLSearchParams(location.search);
  const stepName = searchParams.get("stepName") || undefined;

  // Used to scroll to the correct element on page load
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Captures which (if any) tab needs to be returned to on using the back button
  const tab = searchParams.get("t") || undefined;

  const user = getUserFromLocalStorage();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [submissionRejectModalOpen, setSubmissionRejectModalOpen] =
    useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [failedPipeline, setFailedPipeline] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [errorAndWarningCount, setErrorAndWarningCount] =
    useState<IErrorWarningCount>({ errors: 0, warnings: 0 });
  const [uploadStatus, setUploadStatus] =
    useState<TFileValidationStatusPolicy>();

  // timeout is enabled if we're validating, an upload ID is present and we haven't finished validating
  // validating and validated are independent and should be treated as such here.
  const timeoutEnabled = validating && !!uploadId && !validated;

  // Fetch latest results
  const fetchLatestPipelineResults = async () => {
    // Fetch and normalise result
    const result = await fetchCurrentPipelineResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
      {
        id: { eq: { value: uploadId } },
      },
    );

    // Each check, see whether we have a failure
    if (result?.failureMessage) {
      setFailedPipeline(true);
    }

    // If we have no result, something has gone very wrong
    if (!result) {
      setHasErrors(true);
      return null;
    }
    return result;
  };

  // Continuously poll the database for information, getting longer between polls each time
  const latestPipelineResults = useQueryData<IAllValidationData | null>(
    // Define cache query keys
    ["latestPipelineResults", uploadId],
    // Function to run on each query
    fetchLatestPipelineResults,
    {
      enabled: true,
      refetchBackoff: {
        enabled: true,
        options: {
          // If we aren't validating, validation has completed or the pipeline (prefect) has failed - stop.
          stopCondition: !validating || validated || failedPipeline,
          // Maximum 15 polls of the database
          limit: 15,
        },
      },
      // Ignore any cached version and keep polling based on other factors/parameters
      staleTime: 0,
    },
  );

  useEffect(() => {
    // If we have no data, don't do anything yet
    if (!latestPipelineResults.data || !uploadId) return;
    // If we're not currently validating and pipeline isn't complete, start validating
    if (!latestPipelineResults.data.completed && !validating) {
      setValidating(true);
      setValidated(false);
    }
    // If we are currently validating, but we're finished, stop validating
    else if (latestPipelineResults.data.completed && validating) {
      setValidating(false);
      setValidated(true);
    }
  }, [latestPipelineResults.data, uploadId, validating]);

  useEffect(() => {
    // If we have data, and specifically something in the validation results column
    // Start counting the errors and warnings
    if (
      latestPipelineResults.data &&
      latestPipelineResults.data.validationResults
    ) {
      const counts = getErrorWarningCounts(
        latestPipelineResults.data.validationResults,
      );

      // Set the errors and warnings to display on the UI
      setErrorAndWarningCount(counts);

      // Set the upload status policy to the current validation status
      setUploadStatus(
        policies[
          latestPipelineResults.data.validationStatus as TFileValidationStatus
        ],
      );
    }

    // If a user has clicked 'goto' on a previous page, scroll to it on this page
    // The scroll occurs horizontally, so will only occur if there are more than 5-6 steps in a pipeline
    if (stepName !== undefined && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      // Remove the param from the URL, as it's no longer needed
      searchParams.delete("stepName");

      // Set the url again minus the removed part
      history.replace({
        search: searchParams.toString(),
      });
    }
  }, [latestPipelineResults.data, stepName]);

  // Set a timeout to do a pseudo check whether a prefect run has failed.
  // This is less necessary now, because prefect emits errors on failure,
  // But is useful for timing out when in development as Prefect won't send data to local DB.
  useTimeout(
    async () => {
      await setValidationTimeout(
        PIPELINE_DS,
        getUserFromLocalStorage()?.id || "",
        uploadId,
      );
      // Refetch after successful timeout
      await latestPipelineResults.refetch();
      setFailedPipeline(true);
    },
    VALIDATION_TIMEOUT_MS,
    { enabled: timeoutEnabled, startOnMount: timeoutEnabled },
  );

  // Create an action context if data and user is available
  const actionContext =
    latestPipelineResults.data && user
      ? {
          // Everything uses arrays, even if we're dealing with a singular item
          items: [latestPipelineResults.data],
          dataSource: PIPELINE_DS,
          user,
          setReportOpen,
          setSubmissionRejectModalOpen,
        }
      : null;

  // Create page dropown actions
  const dropdownActions =
    // Ensure there is a status and context
    uploadStatus && actionContext
      ? uploadStatus.allowedActions
          // Map over each action id and return the action of that ID
          .map((actionId: TFileValidationActionId) => actions[actionId])
          // Filter out any actions not available
          .filter((action: TFileValidationAction) => {
            if (!action) return false;
            return !action.isAvailable || action.isAvailable(actionContext);
          })
          // Map over the rest of the available actions
          .map((action: TFileValidationAction) => ({
            name: action.label,
            action: async () => {
              // Complete the action
              await action.callback(actionContext);
              // Invalidate the query in cache to update the page
              await queryClient.invalidateQueries({
                queryKey: ["latestPipelineResults", uploadId],
              });
            },
          }))
      : [];

  const Results = (
    <div className="tol-file-validation-results-page-container">
      <div>
        {latestPipelineResults && (
          <>
            <div className="tol-file-validation-results-page-info-container">
              <div className="tol-file-validation-results-page-info-inner-container">
                <h4>Results for Pipeline #{latestPipelineResults.data.id}</h4>
                <h6>Pipeline: {latestPipelineResults.data?.pipelineName}</h6>
              </div>
              <div>
                <div className="tol-file-validation-results-page-status">
                  <h4 style={{ color: `${uploadStatus?.textColor}` }}>
                    {uploadStatus?.rename}
                  </h4>
                  {latestPipelineResults.data.failureMessage && (
                    <IconTooltip
                      contents={`Failure reason: ${latestPipelineResults.data.failureMessage}`}
                      disableMarkdown
                    />
                  )}
                  {latestPipelineResults.data.rejectionReason && (
                    <IconTooltip
                      contents={`Rejection reason: ${latestPipelineResults.data.rejectionReason}`}
                      disableMarkdown
                    />
                  )}
                </div>
                <p className="tol-file-validation-results-page-info-date">
                  {new Date(
                    latestPipelineResults.data.dateStarted,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="tol-file-validation-results-page-additional-info">
              <div>
                <h6>Flow ID: {latestPipelineResults.data.flowRunId}</h6>
                <p>
                  Updated At:{" "}
                  {new Date(
                    latestPipelineResults.dataUpdatedAt,
                  ).toLocaleString()}
                </p>
              </div>
              <div className="tol-file-validation-results-page-error-count-container">
                <p>Number of Warnings: {errorAndWarningCount.warnings}</p>
                <p>Number of Errors: {errorAndWarningCount.errors}</p>
                <span className="tol-file-validation-results-page-error-count-button">
                  <Button
                    icon="rotate"
                    tooltip="Refresh"
                    disabled={
                      latestPipelineResults?.data.completed ||
                      latestPipelineResults?.data.failureMessage !== null
                    }
                    onClick={() => latestPipelineResults.refetch()}
                    timeout={BUTTON_TIMEOUT}
                  />
                  <DropdownButtons
                    mainButtonIcon={{ icon: "bars" }}
                    placement="leftStart"
                    menuStyle={{ marginRight: "5px" }}
                    dropdownButtons={
                      dropdownActions.length > 0
                        ? dropdownActions
                        : [{ name: "No Actions Available", disabled: true }]
                    }
                  />
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
          onClick={() => {
            // Return user to previous page and goto tab 2 - (E.g. 'Uploaded Manifests' in Portal)
            if (tab !== undefined) history.push("/manifest-validation?t=2");
            else history.push("/manifest-validation");
          }}
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
      // If there are no errors, return results, otherwise show only an error popup
      component: !hasErrors ? Results : Errors,
      type: "full",
    },
  ];

  // If no 200 status is returned, wait for results
  return !latestPipelineResults.isSuccess ? (
    <LoadingContent text="Loading Results..." />
  ) : (
    <>
      <ValidationReport
        data={[latestPipelineResults.data]}
        open={reportOpen}
        setOpen={setReportOpen}
      />
      <SubmissionRejectModal
        open={submissionRejectModalOpen}
        setOpen={setSubmissionRejectModalOpen}
        uploadIds={[uploadId]}
      />
      <PreviousUploadsModal
        openModal={openModal}
        setOpenModal={(open) => setOpenModal(Boolean(open))}
      />
      <Widgets components={ResultsViewer} />
    </>
  );
}
