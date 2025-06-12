/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from "rsuite";
import {
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DropdownButtons,
  Modal,
  TolLoader,
} from "../tol-ui/src";
import { FileData } from "../tol-ui/src/forms/Dropzone";
import { ValidateSteps, PreviousUploads } from "../tol-ui/src/file-validation";

interface IValidationConfig {
  s3_url: string;
  pipeline: string;
  destination: string;
}

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

const data = [
  {
    id: "step1",
    stepName: "validate_species_not_null",
    errors: ["OH NO!", "Error 1b", "Error 1c"],
  },
  {
    id: "step2",
    stepName: "validate_species_is_valid",
    errors: ["Error 2a", "Error 2b", "Error 2c"],
  },
  {
    id: "step3",
    stepName: "Step 3",
    errors: [
      "The user is a silly silly silly silly goose...",
      "Error 3b",
      "Error 3c",
      "Error 3d",
      "Error 3e",
    ],
  },
  { id: "step4", stepName: "Step 4", errors: [] },
  { id: "step5", stepName: "Step 5", errors: [] },
  { id: "step6", stepName: "Step 6", errors: ["error 6a", "error 6b"] },
  { id: "step7", stepName: "Step 7", errors: [] },
  { id: "step8", stepName: "Step 8", errors: ["error 8a", "error 8b"] },
];

function FileValidation(props: Props) {
  const {
    endpoint,
    validationConfig,
    pageTitle = "File Validation",
    fileType = DEFAULT_FILE_TYPE,
  } = props;

  const [validateAndUpload, setValidateAndUpload] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<string | boolean>(false);
  const [fileDropped, setFileDropped] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(true);
  const [validationResults, setValidationResults] = useState<any[]>(["1"]);
  const [validated, setValidated] = useState<boolean>(false);
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [resetting, setResetting] = useState<boolean>(false);
  const [validationProgress, setValidationProgress] = useState<number>(0);
  const [expandedModalResults, setExpandedModalResults] = useState<
    string | null
  >(null);

  const generateMessages = (apiRes: any) => {
    return [];
  };

  const handleToggleUploadResults = (id: string) => {
    setExpandedModalResults(expandedModalResults === id ? null : id);
  };

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      setFileDropped(false);
      setValidated(false);
      setValidationResults([]);
      setFileList([]);
      setResetKey((prev) => prev + 1);
      setValidating(false);
      setResetting(false);
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
                disabled={!validated}
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
              setTimeout(() => {
                setValidationResults(["1"]);
              }, 3000);
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
      <h6>Results:</h6>
      {validationResults.length > 0 === false ? (
        <div className="tol-file-upload-results-viewer-container">
          <TolLoader
            size="lg"
            content="Waiting for Results..."
            vertical
            styles={{ ...(TOL_LOADER_STYLES as React.CSSProperties) }}
          />
        </div>
      ) : (
        <ValidateSteps data={data} />
      )}
    </div>
  );

  const ResultsViewerModal = (
    <Modal
      open={openModal === "results"}
      header={<h3>Previous Validations</h3>}
      children={
        <div>
          <PreviousUploads
            data={data}
            id="12312"
            expanded={expandedModalResults === "12312"}
            onToggle={handleToggleUploadResults}
          />
          <PreviousUploads
            data={data}
            id="234342"
            expanded={expandedModalResults === "234342"}
            onToggle={handleToggleUploadResults}
          />
          <PreviousUploads
            data={data}
            id="456454"
            expanded={expandedModalResults === "456454"}
            onToggle={handleToggleUploadResults}
          />
          {/* TODO: no hard coded id's */}
        </div>
      }
      onClose={() => setOpenModal(false)}
      setOpen={setOpenModal}
    />
  );

  const helpModal = (
    <Modal
      open={openModal === "help"}
      onClose={() => setOpenModal(false)}
      setOpen={setOpenModal}
    />
  );

  const Components = [
    {
      component: TitleBar,
      size: "xl",
    },
    {
      component: FileUploader,
      size: "full",
    },
  ];

  const ValidationSteps = [
    {
      component: ResultsViewer,
      size: "full",
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

// TODO: Render a single modal with different content
// TODO: Implement upload button logic
// TODO: Implement progress bar
// TODO: Implement moving validation results to modal on 'reset'
// TODO: Implement validation results
