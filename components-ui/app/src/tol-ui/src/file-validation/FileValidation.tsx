/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toggle } from "rsuite";
import {
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DropdownButtons,
  Modal,
  TolLoader,
  TsDataSource,
  Icon,
} from "../index";
import { FileData } from "../forms/Dropzone";
import {
  ValidateSteps,
  PreviousUploads,
  fetchAndNormaliseAllUploadResults,
  IValidationConfig,
  IPipelineUpload,
  uploadPipelineConfig,
  fetchCurrentPipelineResults,
  constructCompletionMessage,
  REFRESH_INTERVAL,
  determineUploadStatus,
  getErrorWarningCounts,
} from "../file-validation";
import { getUserFromLocalStorage } from "../services/localStorage/localStorageService";
import { VALIDATION_ENDPOINTS } from "../constants";

interface Props {
  endpoint: string;
  validationConfig: IValidationConfig;
  fileType?: string;
  pageTitle?: string;
}

const DEFAULT_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
const TOL_LOADER_STYLES = {
  minHeight: "250px",
  flexDirection: "column",
  alignItems: "center",
  display: "flex",
};

function FileValidation(props: Props) {
  const {
    endpoint,
    validationConfig,
    pageTitle = "File Validation / Manifest Validation",
    fileType = DEFAULT_FILE_TYPE,
  } = props;

  const [validateAndUpload, setValidateAndUpload] = useState<boolean>(false);
  const [expandedResults, setExpandedResults] = useState<string | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [showPassedSteps, setShowPassedSteps] = useState<boolean>(true);
  const [validationStatus, setValidationStatus] = useState<{}>({
    className: "",
    text: "",
  });
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);

  const ds = new TsDataSource();
  const { id } = getUserFromLocalStorage();

  const fetchPreviousUploads = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cache_bust=${Date.now()}`;
    return await fetchAndNormaliseAllUploadResults(ds, cacheBustedEndpoint, id);
  };

  const fetchLatestPipelineResults = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cache_bust=${Date.now()}`;
    if (!currentUploadId) {
      return null;
    }
    return await fetchCurrentPipelineResults(
      ds,
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
    refetchInterval: validating ? REFRESH_INTERVAL : false,
    staleTime: 0,
  });

  useEffect(() => {
    if (latestPipelineResults) {
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

        console.log(status);

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

  const {
    data: userFileValidationUploadsData = [],
    isLoading,
    isError,
    refetch: refetchAllUploads,
    dataUpdatedAt: allUploadsUpdatedAt,
  } = useQuery({
    queryKey: ["userFileValidationUploads", id],
    queryFn: fetchPreviousUploads,
    enabled: openModal === "results",
    refetchInterval: openModal === "results" ? REFRESH_INTERVAL : false,
    staleTime: 0,
  });

  const generateMessages = async (fileName: string[]) => {
    const pipeline_id = await uploadPipelineConfig(
      ds,
      validationConfig,
      fileName[0],
      "spreadsheet_config"
    );
    setCurrentUploadId(pipeline_id);
  };

  const handleToggleUploadResults = (id: string) => {
    setExpandedResults(expandedResults === id ? null : id);
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
              generateMessages(fileList.map((file: FileData) => file.name));
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
        endpoint={endpoint}
        fileType={fileType}
        generateMessages={generateMessages}
        onFileDrop={(fileDropped: boolean) => setFileDropped(fileDropped)}
        fileList={fileList}
        setFileList={setFileList}
        parentToSubmit
        resetKey={resetKey}
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
            timeout={3000}
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
            steps={latestPipelineResults["pipelineSteps"]}
            completed={latestPipelineResults.completed}
          />
        )
      )}
    </div>
  );

  const ResultsModalContent = (
    <div
      className="tol-file-validation-previous-uploads-modal-container 
    tol-file-validation-scrollbar-fix"
    >
      {isLoading ? (
        <TolLoader
          size="lg"
          content="Loading..."
          vertical
          styles={TOL_LOADER_STYLES}
        />
      ) : isError ? (
        <div className="tol-file-validation-error-info">
          <span className="tol-file-validation-error-icon">
            <Icon icon="info" size="lg" />
          </span>
          <h6>Error loading uploads.</h6>
        </div>
      ) : userFileValidationUploadsData.length > 0 ? (
        userFileValidationUploadsData
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((upload: IPipelineUpload, index: number) => {
            return (
              <div
                key={`${upload.id}-${allUploadsUpdatedAt}-${index}`}
                className="tol-file-validation-previous-uploads-inner-container"
              >
                <PreviousUploads
                  data={upload}
                  id={upload.id}
                  expanded={expandedResults === upload.id}
                  onToggle={handleToggleUploadResults}
                  showPassedSteps={showPassedSteps}
                  completed={upload.completed}
                />
              </div>
            );
          })
      ) : (
        <div className="tol-file-validation-error-info">
          <span className="tol-file-validation-error-icon">
            <Icon icon="info" size="lg" />
          </span>
          <h6>No previous uploads found.</h6>
        </div>
      )}
    </div>
  );

  const ResultsModalHeader = (
    <div className="tol-file-validation-previous-uploads-modal-header">
      <div className="tol-file-validation-previous-uploads-modal-header-content">
        <h3>Previous Validations</h3>
        <p>Last updated at: {new Date(allUploadsUpdatedAt).toLocaleString()}</p>
      </div>
      <div className="tol-file-validation-previous-uploads-modal-toggle">
        <p className="tol-file-validation-previous-uploads-modal-toggle-tag">
          Show passed steps
        </p>
        <Toggle
          key="passed-steps-toggle"
          checked={showPassedSteps}
          onChange={() => setShowPassedSteps((prev: boolean) => !prev)}
        />
        <div>
          <Button
            icon="rotate"
            tooltip="Refresh"
            onClick={() => refetchAllUploads()}
            timeout={3000}
          />
        </div>
      </div>
    </div>
  );

  const ResultsViewerModal = (
    <div>
      <Modal
        open={openModal === "results"}
        header={ResultsModalHeader}
        children={ResultsModalContent}
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
        onExited={() => setExpandedResults(null)}
      />
    </div>
  );

  const helpModal = (
    <div>
      <Modal
        open={openModal === "help"}
        header={<h3>File Validation Help</h3>}
        children={<h6>You can download </h6>}
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
      {ResultsViewerModal}
      {helpModal}
      <Widgets components={Components} />
      {validating && (
        <div
          className={`tol-file-upload-results-container tol-file-upload-results-dropdown-animation
          ${
            resetting ? "tol-file-upload-results-dropdown-hide-animation" : ""
          }`}
        >
          <Widgets components={ValidationSteps} />
        </div>
      )}
    </>
  );
}

export default FileValidation;

// TODO: add help modal with instructions on how to use the validation
// TODO: Create a summary of the validation results
// TODO: Add 'view results' button to validation results viewer
