/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

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
import { ValidateSteps } from "../tol-ui/src/file-validation";

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
  minHeight: "300px",
  flexDirection: "column",
  alignItems: "center",
  display: "flex",
};

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
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [validated, setValidated] = useState<boolean>(false);
  const [fileList, setFileList] = useState<FileData[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);
  const [resetting, setResetting] = useState<boolean>(false);
  const [validationProgress, setValidationProgress] = useState<number>(0);

  const generateMessages = (apiRes: any) => {
    return [];
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
                name: "Previous Uploads",
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
      <h6>Results: </h6>
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
        <ValidateSteps />
      )}
    </div>
  );

  const ResultsViewerModal = (
    <div>
      <Modal
        open={openModal === "results"}
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
      />
    </div>
  );

  const helpModal = (
    <div>
      <Modal
        open={openModal === "help"}
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
      />
    </div>
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
// TODO: 
// TODO: 
// TODO: 
// TODO: 
