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
  FileData,
  TsDataSource,
  DEFAULT_FILE_TYPE,
} from "..";

export interface PFileValidation {
  objectType: string;
  validationConfig: IValidationConfig;
  fileType?: string;
  pageTitle?: string;
  defaultFileTemplateLink?: string;
}

export const PIPELINE_DS = new TsDataSource();

export function FileValidation(props: PFileValidation) {
  const {
    objectType,
    validationConfig,
    pageTitle = "File Validation / Manifest Validation",
    fileType = DEFAULT_FILE_TYPE,
    defaultFileTemplateLink = "",
  } = props;

  const [validateAndUpload, setValidateAndUpload] = useState<boolean>(false);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [stepsFound, setStepsFound] = useState<boolean>(false);
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

  const handleValidation = async (fileName: string[]) => {
    const pipeline_id = await uploadPipelineConfig(
      PIPELINE_DS,
      validationConfig,
      fileName[0]
    );
    setCurrentUploadId(pipeline_id?.id);
  };

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
                text={"Upload File"}
                disabled={
                  !validated ||
                  validationStatus.text !== "Passed" ||
                  validationStatus.text !== "Passed with Warnings"
                }
                onClick={() => {
                  setValidating(true);
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
              handleValidation(fileList.map((file: FileData) => file.name));
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
                !validateAndUpload ? "and upload enabled" : "only enabled"
              }.`,
            });
          }}
        />
        <p>Validate and upload</p>
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
          <h6>
            You can download a template file for uploading documents{" "}
            <a href={defaultFileTemplateLink}>here</a>
          </h6>
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
