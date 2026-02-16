/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from "react";
import {
  ValidateSteps,
  uploadPipelineConfig,
  fetchCurrentPipelineResults,
  constructCompletionMessage,
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
  TsDataSource,
  DEFAULT_FILE_TYPE,
  downloadFileFromS3,
  useQueryData,
  VALIDATION_PURPOSE,
  onSubmission,
  ValidationReport,
  getUserFromLocalStorage,
  setValidationTimeout,
  useTimeout,
  VALIDATION_TIMEOUT_MS,
  downloadReportFile,
  USER_SHOWN_FILE_TYPE_DEFAULTS,
  MAX_FILE_SIZE,
  DEFAULT_SHEET_NAME,
  BASE_POLICIES_MAP,
  useValidationPolicyModule,
} from "..";

import type {
  IFileData,
  IValidationConfig,
  IAllValidationData,
  TFileValidationPurpose,
} from "..";

export interface PFileValidationUploadAndResults {
  validationConfig: IValidationConfig;
  objectType?: string;
  fileType?: string;
  pageTitle?: string;
  defaultFileTemplateName?: string;
}

export const PIPELINE_DS = new TsDataSource();

export function FileValidationUploadAndResults(
  props: PFileValidationUploadAndResults,
) {
  const {
    pageTitle = "File Validation / Manifest Validation",
    fileType = DEFAULT_FILE_TYPE,
    defaultFileTemplateName = "",
  } = props;

  const validationConfig = {
    sheetName: DEFAULT_SHEET_NAME,
    maxFileSize: MAX_FILE_SIZE,
    allowedFileTypes: USER_SHOWN_FILE_TYPE_DEFAULTS,
    ...props.validationConfig,
  };

  // TODO: re-enable type checking when mode toggle is re-introduced
  // @ts-ignore
  const [purpose, setPurpose] = useState<TFileValidationPurpose>(
    VALIDATION_PURPOSE.VALIDATE_ONLY,
  );
  const [currentUploadId, setCurrentUploadId] = useState<string>("");
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<IFileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [stepsFound, setStepsFound] = useState<boolean>(false);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);
  const [pipelineFailed, setPipelineFailed] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<{
    className: string;
    text: string;
  }>({
    className: "",
    text: "",
  });

  const policy = useValidationPolicyModule();

  useEffect(() => {
    async function cleanUpValidations() {
      await setValidationTimeout(
        PIPELINE_DS,
        getUserFromLocalStorage()?.id || "",
      );
    }
    cleanUpValidations();
  }, []);

  const fetchLatestPipelineResults = async () => {
    const cacheBustedEndpoint = `${
      VALIDATION_ENDPOINTS.UPLOAD
    }?_cb=${Date.now()}`;
    if (!currentUploadId) {
      return null;
    }
    return await fetchCurrentPipelineResults(PIPELINE_DS, cacheBustedEndpoint, {
      id: { eq: { value: currentUploadId } },
    });
  };

  const latestPipelineResults = useQueryData<IAllValidationData | null>(
    ["latestPipelineResults", currentUploadId],
    fetchLatestPipelineResults,
    {
      enabled: validating && !!currentUploadId && !validated,
      refetchBackoff: {
        enabled: true,
        options: {
          stopCondition: !validating && !stepsFound,
        },
      },
      staleTime: 0,
    },
  );

  const timeoutEnabled = validating && !!currentUploadId && !validated;

  useTimeout(
    async () => {
      await setValidationTimeout(
        PIPELINE_DS,
        getUserFromLocalStorage()?.id || "",
        currentUploadId,
      );
      await latestPipelineResults.refetch();
      setPipelineFailed(true);
    },
    VALIDATION_TIMEOUT_MS,
    { enabled: timeoutEnabled, startOnMount: timeoutEnabled },
  );

  useEffect(() => {
    if (latestPipelineResults.data) {
      setStepsFound(latestPipelineResults.data.pipelineSteps?.length > 0);

      if (latestPipelineResults.data.completed || pipelineFailed) {
        setValidated(true);

        // const counts = getErrorWarningCounts(
        //   latestPipelineResults.data.validationResults,
        // );

        // const status = determineUploadStatus(
        //   latestPipelineResults.data.completed,
        //   counts.errors,
        //   counts.warnings,
        //   latestPipelineResults.data.failureMessage || null,
        //   latestPipelineResults.data.is_ready,
        // );

        setValidationStatus(status);

        const completionMessage = constructCompletionMessage(
          latestPipelineResults.data.validationResults,
          latestPipelineResults.data.failureMessage,
        );

        PopUpMessage({
          type: completionMessage.messageType,
          message: `Validation completed. ${completionMessage.message}`,
          persist: completionMessage.messageType === "error" ? true : false,
        });

        if (!pipelineFailed) setOpenReport(true);
      }
    }
  }, [latestPipelineResults.data, pipelineFailed]);

  const handleValidation = async (file: IFileData) => {
    PopUpMessage({
      type: "info",
      message: "Starting validation process...",
    });
    const pipeline_id = await uploadPipelineConfig(
      PIPELINE_DS,
      validationConfig,
      file,
      true,
    );
    setCurrentUploadId(pipeline_id || "");
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
      setCurrentUploadId("");
    }, 500);
  };

  const onSubmissionClick = () => {
    return onSubmission(
      validationConfig,
      fileList,
      false,
      currentUploadId,
      setFileUploaded,
      //   () =>
      //     setValidationStatus({
      //       className: "marked-as-ready",
      //       text: "Marked as Ready",
      //     }),
    );
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
            <Button
              icon="clipboard-check"
              tooltip="View results of latest validation"
              onClick={() => {
                setOpenReport((prev: boolean) => !prev);
              }}
              disabled={!validated}
            />
            <Button
              icon="download"
              tooltip="Download results of latest validation"
              onClick={() => downloadReportFile(latestPipelineResults.data)}
              disabled={!validated}
            />
            {validated && (
              <Button
                type="success"
                text={"Mark As Ready"}
                disabled={
                  !validated ||
                  !validationStatus.text.includes("Passed") ||
                  fileUploaded ||
                  validationStatus.text === "Marked as Ready"
                }
                onClick={onSubmissionClick}
              />
            )}
          </div>
          <Button
            type="primary"
            text={"Validate"}
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
      {/* <div className="tol-file-upload-uploader-container"> TODO: Re-add if we re-introduce mode toggle
        <p>{VALIDATION_PURPOSE.VALIDATE_ONLY}</p>
        <Toggle
          key="validation-type-toggle"
          checked={purpose !== VALIDATION_PURPOSE.VALIDATE_ONLY}
          disabled={validating}
          onChange={() => {
            const newPurpose = getNextPurpose(purpose, submittable);
            setPurpose(newPurpose);
            setValidating(false);
            PopUpMessage({
              type: "info",
              message: `Mode changed to ${newPurpose}`,
            });
          }}
        />
        <p>{submittable ? VALIDATE_AND_UPLOAD : VALIDATE_AND_MARK_AS_READY}</p>
      </div> */}
      <Dropzone
        resource={""}
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
            Last updated at:{" "}
            {new Date(latestPipelineResults.dataUpdatedAt).toLocaleString()}
          </p>
        </div>
        <div className="tol-file-upload-results-viewer-content-inner-container">
          <h6
            className={`tol-file-upload-results-viewer-content-status
              tol-file-validation-results-status
              ${validationStatus.className}`}
          >
            {latestPipelineResults?.data?.completed || pipelineFailed
              ? `${validationStatus.text}`
              : "In Progress"}
          </h6>
          <Button
            icon="rotate"
            tooltip="Refresh"
            disabled={latestPipelineResults?.data?.completed}
            onClick={() => latestPipelineResults.refetch()}
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
        latestPipelineResults?.data?.validationResults && (
          <ValidateSteps
            data={latestPipelineResults.data.validationResults}
            steps={latestPipelineResults.data.pipelineSteps}
            completed={latestPipelineResults.data.completed}
            failureMessage={latestPipelineResults.data.failureMessage}
          />
        )
      )}
    </div>
  );

  const HelpModal = (
    <Modal
      open={openModal === "help"}
      header={<h3>File Validation Help</h3>}
      children={
        <>
          <h6
            onClick={() =>
              downloadFileFromS3(
                PIPELINE_DS,
                validationConfig.s3_bucket,
                defaultFileTemplateName,
              )
            }
          >
            You can download a template file for uploading spreadsheet files{" "}
            <a href="#">here</a>.
          </h6>
          .<h6>Requirements:</h6>
          <ul>
            {" "}
            <li>{`Max file size: ${validationConfig.maxFileSize}`}</li>
            <li>{`Allowed File Types: ${validationConfig.allowedFileTypes}`}</li>
            <li>{`Only data under sheet name: "${validationConfig.sheetName}" will be valid.`}</li>
          </ul>
          <h6>Status Messages:</h6>
          <div className="tol-file-upload-status-table">
            {" "}
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(BASE_POLICIES_MAP).map(([_, validation]) => (
                  <tr key={validation.rename}>
                    <td>
                      <strong style={{ color: `${validation.textColor}` }}>
                        {validation.rename}
                      </strong>
                    </td>
                    <td>{validation.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h6>Additional:</h6>
          <ul>
            <li>
              {" "}
              You can find any of your previous submissions in the "Previous
              Validations" section.
            </li>
            <li>
              {" "}
              You can click on "View Report" on any specific submission page to
              see a breakdown of the validation results.
            </li>
          </ul>
        </>
      }
      onClose={() => setOpenModal(false)}
      setOpen={setOpenModal}
    />
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
      <ValidationReport
        data={validated ? latestPipelineResults.data : null}
        open={openReport}
        setOpen={setOpenReport}
        uploadStatus={latestPipelineResults.data.validationStatus}
      />
      <PreviousUploadsModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onEnter={async () =>
          await setValidationTimeout(
            PIPELINE_DS,
            getUserFromLocalStorage()?.id || "",
          )
        }
      />
      {HelpModal}
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
