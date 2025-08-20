/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toggle } from "rsuite";
import {
  ValidateSteps,
  IValidationConfig,
  IPipelineUpload,
  uploadPipelineConfig,
  fetchCurrentPipelineResults,
  constructCompletionMessage,
  REFRESH_INTERVAL,
  determineUploadStatus,
  getErrorWarningCounts,
  PreviousUploadsModal,
  TOL_LOADER_STYLES,
  BUTTON_TIMEOUT,
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DropdownButtons,
  Modal,
  TolLoader,
  VALIDATION_ENDPOINTS,
  IFileData,
  TsDataSource,
  DEFAULT_FILE_TYPE,
  downloadFileFromS3,
} from "..";

export interface PFileValidation {
  objectType: string;
  validationConfig: IValidationConfig;
  fileType?: string;
  pageTitle?: string;
  defaultFileTemplateName?: string;
}

export const PIPELINE_DS = new TsDataSource();

export function FileValidation(props: PFileValidation) {
  const {
    objectType,
    validationConfig,
    pageTitle = "File Validation / Manifest Validation",
    fileType = DEFAULT_FILE_TYPE,
    defaultFileTemplateName = "",
  } = props;

  const [validateAndUpload, setValidateAndUpload] = useState<boolean>(false);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<IFileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [stepsFound, setStepsFound] = useState<boolean>(false);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<{
    className: string;
    text: string;
  }>({
    className: "",
    text: "",
  });

  const fetchLatestPipelineResults = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cb=${Date.now()}`;
    if (!currentUploadId) {
      return null;
    }
    return await fetchCurrentPipelineResults(
      PIPELINE_DS,
      cacheBustedEndpoint,
      currentUploadId
    );
  };

  const {
    data: latestPipelineResults = {} as IPipelineUpload | null,
    refetch: refetchLatestPipelineResults,
    dataUpdatedAt: latestResultsUpdatedAt,
  } = useQuery({
    queryKey: ["latestPipelineResults", currentUploadId],
    queryFn: fetchLatestPipelineResults,
    enabled: validating && currentUploadId !== null && !validated,
    refetchInterval: validating && stepsFound ? REFRESH_INTERVAL : false,
    staleTime: 0,
  });

  useEffect(() => {
    if (latestPipelineResults) {
      setStepsFound(latestPipelineResults.pipelineSteps?.length > 0);

      if (latestPipelineResults.completed) {
        setValidated(true);

        const counts = getErrorWarningCounts(
          latestPipelineResults.validationResults
        );

        const status = determineUploadStatus(
          latestPipelineResults.completed,
          counts.errors,
          counts.warnings,
          latestPipelineResults.failureMessage || null
        );

        setValidationStatus(status);

        const completionMessage = constructCompletionMessage(
          latestPipelineResults.validationResults,
          latestPipelineResults.failureMessage
        );

        PopUpMessage({
          type: completionMessage.messageType,
          message: `Validation completed. ${completionMessage.message}`,
        });
      }
    }
  }, [latestPipelineResults]);

  const handleValidation = async (file: IFileData) => {
    const pipeline_id = await uploadPipelineConfig(
      PIPELINE_DS,
      validationConfig,
      file,
      !validateAndUpload
    );
    setCurrentUploadId(pipeline_id);
  };

  useEffect(() => {
    console.log(validating);
    console.log(currentUploadId);
  }, [validating, currentUploadId]);

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      setFileDropped(false);
      setValidated(false);
      setFileList([]);
      setResetKey((prev: number) => prev + 1);
      setValidating(false);
      setResetting(false);
      setCurrentUploadId(null);
    }, 500);
  };

  const TitleBar = (
    <div className="tol-file-upload-title-bar-container">
      <h2>{pageTitle}</h2>
      <div className="tol-file-upload-title-btn-container">
        <div className="tol-file-upload-btn-inner-container">
          <div
            className={`tol-file-upload-additional-btn-container ${
              validating ? "tol-file-upload-btn-dropdown-animation" : ""
            } ${
              resetting ? "tol-file-upload-btn-dropdown-hide-animation" : ""
            }`}
          >
            {validating && (
              <Button
                type="error"
                text={"Reset"}
                onClick={() => handleReset()}
              />
            )}
            {!validateAndUpload && validating && (
              <Button
                type="success"
                text={"Submit File"}
                disabled={
                  !validated ||
                  (validationStatus.text !== "Passed" &&
                    validationStatus.text !== "Passed with Warnings") ||
                  fileUploaded
                }
                onClick={async () => {
                  await uploadPipelineConfig(
                    PIPELINE_DS,
                    validationConfig,
                    fileList[0],
                    false,
                    currentUploadId
                  ).finally(() => {
                    setFileUploaded(true);
                  });
                }}
              />
            )}
          </div>
          <Button
            type="primary"
            text={`${
              validateAndUpload ? "Validate and Upload" : "Validate File "
            }`}
            disabled={!fileDropped || validating}
            onClick={() => {
              setValidating(true);
              handleValidation(fileList[0]);
            }}
          />
          <DropdownButtons
            mainButtonIcon={{ icon: "bars" }}
            placement="leftStart"
            menuStyle={{ marginRight: "5px" }}
            dropdownButtons={[
              {
                name: "Previous Validations",
                action: () => {
                  setOpenModal("results");
                },
              },
              {
                name: "Help",
                action: () => {
                  setOpenModal("help");
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const FileUploader = (
    <div>
      <div className="tol-file-upload-uploader-container">
        <p>Validate only</p>
        <Toggle
          key="validation-type-toggle"
          checked={validateAndUpload}
          disabled={validating}
          onChange={() => {
            setValidateAndUpload(!validateAndUpload);
            setValidating(false);
            PopUpMessage({
              type: "info",
              message: `File validation ${
                !validateAndUpload ? "and submission enabled" : "only enabled"
              }.`,
            });
          }}
        />
        <p>Validate and submit</p>
      </div>
      <Dropzone
        resource={objectType}
        dataSource={PIPELINE_DS}
        fileType={fileType}
        onFileDrop={(fileDropped: boolean) => setFileDropped(fileDropped)}
        fileList={fileList}
        setFileList={setFileList}
        parentToSubmit
        resetKey={resetKey}
        validating={validating}
      />
    </div>
  );

  const ResultsViewer = (
    <div>
      <div className="tol-file-upload-results-viewer-outer-container">
        <div>
          <h6>Results:</h6>
          <p>
            Last updated at: {new Date(latestResultsUpdatedAt).toLocaleString()}
          </p>
        </div>
        <div className="tol-file-upload-results-viewer-content-inner-container">
          <h6 className="tol-file-upload-results-viewer-content-status">
            {latestPipelineResults?.completed
              ? `${validationStatus.text}`
              : "In Progress"}
          </h6>
          <Button
            icon="rotate"
            tooltip="Refresh"
            disabled={latestPipelineResults?.completed}
            onClick={() => refetchLatestPipelineResults()}
            timeout={BUTTON_TIMEOUT}
          />
        </div>
      </div>
      {!latestPipelineResults ? (
        <div className="tol-file-upload-results-viewer-container">
          <TolLoader
            size="lg"
            content="Waiting for Results..."
            vertical
            styles={{ ...(TOL_LOADER_STYLES as React.CSSProperties) }}
          />
        </div>
      ) : Array.isArray(latestPipelineResults) ? null : (
        latestPipelineResults?.validationResults && (
          <ValidateSteps
            data={latestPipelineResults.validationResults}
            steps={latestPipelineResults.pipelineSteps}
            completed={latestPipelineResults.completed}
            failureMessage={latestPipelineResults.failureMessage}
          />
        )
      )}
    </div>
  );

  const helpModal = (
    <div>
      <Modal
        open={openModal === "help"}
        header={<h3>File Validation Help</h3>}
        children={
          defaultFileTemplateName && (
            <>
              <h6
                onClick={() =>
                  downloadFileFromS3(
                    PIPELINE_DS,
                    validationConfig.s3_url,
                    defaultFileTemplateName
                  )
                }
              >
                You can download a template file for uploading spreadsheet files{" "}
                <a href="#">here</a>.
              </h6>
              <h6>Modes:</h6>
              <ul>
                <li>
                  <strong>Validate only:</strong> Your file will only be
                  validated, you will receive results as to whether it passes
                  validation. You can choose to submit afterwards, if validation
                  passes successfully.
                </li>
                <li>
                  <strong>Validate and submit:</strong> Your file will be
                  validated and submitted automatically if it passes validation.
                </li>
              </ul>
              <h6>Status Messages:</h6>{" "}
              <ul>
                <li>
                  <strong>Passed:</strong> The file passed validation. If you
                  haven't chosen to submit automatically, you can submit it now.
                </li>
                <li>
                  <strong>Failed:</strong> The entire file validation pipeline
                  has failed. This is usually due to a server error. If the
                  issue persists, please contact an admin. Your file will not be
                  submitted.
                </li>
                <li>
                  <strong>Completed with Errors:</strong> The file validation
                  completed, but there were errors. Please review the error
                  messages and fix the errors before trying again.
                </li>
                <li>
                  <strong>Passed with warnings:</strong> The file passed
                  validation, but there are warnings. These may be minor issues
                  that do not prevent submission.
                </li>
                <li>
                  <strong>In Progress: </strong> The file is currently being
                  validated and results should be coming through in real-time.
                </li>
              </ul>
              <h6>Additional:</h6>
              <ul>
                <li>
                  {" "}
                  You can find any of your previous submissions in the "Previous
                  Validations" section.
                </li>
                <li>
                  {" "}
                  You can click on "View Report" on any specific submission page
                  to see a breakdown of the validation results.
                </li>
              </ul>
            </>
          )
        }
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
      />
    </div>
  );

  const Components = [
    {
      component: TitleBar,
      type: "full",
    },
    {
      component: FileUploader,
      type: "full",
    },
  ];

  const ValidationSteps = [
    {
      component: ResultsViewer,
      type: "full",
    },
  ];

  return (
    <>
      <PreviousUploadsModal openModal={openModal} setOpenModal={setOpenModal} />
      {helpModal}
      <Widgets components={Components} />
      {validating && (
        <div
          className={`tol-file-upload-results-container tol-file-upload-results-dropdown-animation
          ${
            resetting ? "tol-file-upload-results-dropdown-hide-animation" : ""
          }`}
        >
          <Widgets components={currentUploadId ? ValidationSteps : []} />
        </div>
      )}
    </>
  );
}
