/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { Input, InputGroup } from "rsuite";
import { useQueryClient } from "@tanstack/react-query";
import {
  ValidateSteps,
  uploadPipelineConfig,
  fetchCurrentPipelineResults,
  PreviousUploadsModal,
  BUTTON_TIMEOUT,
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DeprecatedDropdownButtons,
  Modal,
  TolLoader,
  VALIDATION_ENDPOINTS,
  DEFAULT_FILE_TYPE,
  downloadFileFromS3,
  useQueryData,
  getUserFromLocalStorage,
  setValidationTimeout,
  useTimeout,
  VALIDATION_TIMEOUT_MS,
  USER_SHOWN_FILE_TYPE_DEFAULTS,
  MAX_FILE_SIZE,
  DEFAULT_SHEET_NAME,
  useValidationPolicyModule,
  createPageActions,
  PIPELINE_DS,
} from "..";

import type {
  IFileData,
  IValidationConfig,
  IAllValidationData,
  TFileValidationStatusPolicy,
} from "..";

export interface PFileValidationUploadAndResults {
  validationConfig: IValidationConfig;
  setReportOpen: Dispatch<SetStateAction<boolean>>;
  setSubmissionMutateModalOpen: Dispatch<SetStateAction<boolean>>;
  setCurrentActionId: Dispatch<SetStateAction<string>>;
  setForceTableUpdate?: Dispatch<SetStateAction<boolean>>;
  setValidationData: Dispatch<SetStateAction<IAllValidationData | null>>;
  setSelectedRows?: Dispatch<SetStateAction<string[]>>;
  objectType?: string;
  fileType?: string;
  pageTitle?: string;
  defaultFileTemplateName?: string;
  setRefetchFn?: Dispatch<SetStateAction<(() => void) | null>>;
}

/**
 * File validation uploader and results viewer. A component that wraps both the
 * upload component, as well as the displaying of realtime results after a validation has begun.
 */
export function FileValidationUploadAndResults(
  props: PFileValidationUploadAndResults,
) {
  const {
    setReportOpen,
    setSubmissionMutateModalOpen,
    setCurrentActionId,
    setValidationData,
    setForceTableUpdate,
    setSelectedRows,
    pageTitle = "File Validation / Manifest Validation",
    fileType = DEFAULT_FILE_TYPE,
    defaultFileTemplateName = "",
    setRefetchFn,
  } = props;

  const validationConfig = {
    sheetName: DEFAULT_SHEET_NAME,
    maxFileSize: MAX_FILE_SIZE,
    allowedFileTypes: USER_SHOWN_FILE_TYPE_DEFAULTS,
    ...props.validationConfig,
  };

  const [uploadId, setUploadId] = useState<string>("");
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [fileList, setFileList] = useState<IFileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [stepsFound, setStepsFound] = useState<boolean>(false);
  const [uploadName, setUploadName] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<
    TFileValidationStatusPolicy | undefined
  >(undefined);
  const [isInitialValidation, setIsInitialValidation] = useState<boolean>(true);

  const { actions, policies } = useValidationPolicyModule();
  const user = getUserFromLocalStorage();
  const queryClient = useQueryClient();

  // Clear up any validations that have been going for more than 8 minutes
  useEffect(() => {
    async function cleanUpValidations() {
      await setValidationTimeout(PIPELINE_DS, user?.id || "");
    }
    cleanUpValidations();
  }, []);

  const fetchLatestPipelineResults = async () => {
    const data = await fetchCurrentPipelineResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
      {
        id: { eq: { value: uploadId } },
      },
    );

    if (data) {
      const status = policies[data.validationStatus];
      setValidationStatus(status);
      setStepsFound(data.pipelineSteps?.length > 0);
      setValidationData(data);

      if (isInitialValidation && (data.completed || status?.isFailureStatus)) {
        setValidated(true);
        setIsInitialValidation(false);
        PopUpMessage({
          type: status?.messageType,
          message: `${status?.message}`,
          persist: true,
        });

        if (!status?.isFailureStatus) setReportOpen(true);
      }

      if (data.completed || status?.isFailureStatus) {
        setForceTableUpdate?.((prev: boolean) => !prev);
        setSelectedRows?.([]);
      }
    }

    return data;
  };

  const latestPipelineResults = useQueryData<IAllValidationData | null>(
    ["latestPipelineResults", uploadId],
    fetchLatestPipelineResults,
    {
      enabled: validating && !!uploadId && !validated,
      refetchBackoff: {
        enabled: true,
        options: {
          stopCondition: !validating && !stepsFound,
        },
      },
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (setRefetchFn) {
      setRefetchFn(() => latestPipelineResults.refetch);
    }
  }, [latestPipelineResults.refetch, setRefetchFn]);

  const timeoutEnabled = validating && !!uploadId && !validated;

  useTimeout(
    async () => {
      await setValidationTimeout(PIPELINE_DS, user?.id || "", uploadId);
      await latestPipelineResults.refetch();
    },
    VALIDATION_TIMEOUT_MS,
    { enabled: timeoutEnabled, startOnMount: timeoutEnabled },
  );

  const handleValidation = async (file: IFileData) => {
    setIsInitialValidation(true);
    PopUpMessage({
      type: "info",
      message: "Starting validation process...",
    });
    const pipeline_id = await uploadPipelineConfig(
      PIPELINE_DS,
      validationConfig,
      file,
      uploadName ?? file.name,
    );
    setUploadId(pipeline_id || "");
  };

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      setValidating(false);
      setButtonLoading(false);
      setFileDropped(false);
      setValidated(false);
      setFileList([]);
      setResetKey((prev: number) => prev + 1);
      setResetting(false);
      setUploadId("");
    }, 500);
  };

  const actionContext =
    latestPipelineResults.data && user
      ? {
          items: [latestPipelineResults.data],
          dataSource: PIPELINE_DS,
          user,
          setReportOpen,
          setSubmissionMutateModalOpen,
        }
      : null;

  const dropdownActions = createPageActions(
    validationStatus,
    actionContext,
    actions,
    setCurrentActionId,
    uploadId,
    queryClient,
    latestPipelineResults.refetch,
  );

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
            {(validating || fileDropped) && (
              <Button
                type="error"
                text={"Reset"}
                onClick={() => handleReset()}
              />
            )}
            {(validating || validated) && (
              <DeprecatedDropdownButtons
                mainButtonIcon={{ icon: "paper-plane", text: "Actions" }}
                placement="leftStart"
                menuStyle={{ marginRight: "5px" }}
                dropdownButtons={dropdownActions}
              />
            )}
            {(!uploadId || !validating) && (
              <Button
                type="primary"
                text={"Validate"}
                loading={buttonLoading}
                disabled={!fileDropped || buttonLoading}
                onClick={() => {
                  setOpenModal("nameUpload");
                }}
              />
            )}
          </div>
          <DeprecatedDropdownButtons
            mainButtonIcon={{ icon: "bars", text: "More" }}
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
          <h6>Results for {latestPipelineResults?.data?.uploadName}:</h6>
          <p>
            Last updated at:{" "}
            {new Date(latestPipelineResults.dataUpdatedAt).toLocaleString()}
          </p>
        </div>
        <div className="tol-file-upload-results-viewer-content-inner-container">
          <h6
            className="tol-file-upload-results-viewer-content-status tol-file-validation-results-status"
            style={{ color: `${validationStatus?.textColor}` }}
          >
            {validationStatus?.rename}
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
      {!latestPipelineResults.data ? (
        <div className="tol-file-upload-results-viewer-container">
          <TolLoader
            size="lg"
            content="Waiting for Results..."
            vertical
            className="tol-file-validation-loader-style"
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
          {defaultFileTemplateName && (
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
          )}
          <h6>Requirements:</h6>
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
                {Object.entries(policies).map(([_, validation]) => (
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

  const NameUploadModal = (
    <Modal
      open={openModal === "nameUpload"}
      header={<h3>Name your submission:</h3>}
      children={
        <div className="tol-file-validation-name-upload-modal-container">
          <p className="tol-file-validation-name-upload-modal-p1">
            Would you like to name your manifest upload before submitting?
          </p>
          <p>
            If your sample manifest is saved with the name given it when shared
            with you by the ToL Sample Management team e.g. "DToL SAMPLE
            MANIFEST_V2.6_NHM_000234", no need to rename your submission.  It
            is recommended to include at least your ‘SAMPLE_SET_ID’ in the
            submission name.
          </p>
          <InputGroup>
            <Input
              name="upload-name-input"
              placeholder={"Upload name..."}
              value={uploadName}
              onChange={(value) => setUploadName(value)}
            />
          </InputGroup>
        </div>
      }
      setOpen={setOpenModal}
      onClose={() => setOpenModal(false)}
      actionButtonInline
      onEnter={() => setUploadName(fileList?.[0]?.name)}
      actionButton={
        <Button
          icon="check"
          text="Validate"
          onClick={() => {
            setButtonLoading(true);
            setValidating(true);
            handleValidation(fileList[0]);
            setOpenModal(false);
          }}
        />
      }
      closeButton={false}
      size="sm"
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
      <PreviousUploadsModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onEnter={async () =>
          await setValidationTimeout(PIPELINE_DS, user?.id || "")
        }
      />
      {HelpModal}
      {NameUploadModal}
      <Widgets components={Components} />
      {validating && (
        <div
          className={`tol-file-upload-results-container tol-file-upload-results-dropdown-animation
          ${
            resetting ? "tol-file-upload-results-dropdown-hide-animation" : ""
          }`}
        >
          <Widgets components={uploadId ? ValidationSteps : []} />
        </div>
      )}
    </>
  );
}
