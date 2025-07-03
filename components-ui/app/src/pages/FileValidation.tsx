/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Toggle } from "rsuite";
import {
  Widgets,
  Dropzone,
  PopUpMessage,
  Button,
  DropdownButtons,
  Modal,
  TolLoader,
  httpClient,
  TsDataSource,
  Icon,
} from "../tol-ui/src";
import { FileData } from "../tol-ui/src/forms/Dropzone";
import {
  ValidateSteps,
  PreviousUploads,
  severityType,
  normalisePipelineUpload,
  fetchAndNormaliseAllUploadResults,
} from "../tol-ui/src/file-validation";
import { getUserFromLocalStorage } from "../tol-ui/src/services/localStorage/localStorageService";

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
    code: "",
    field: "E",
    detail: "Field is required.",
    severity: "warning",
    object_id: "1",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: "D",
    detail: "Field is required.",
    severity: "error",
    object_id: "2",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: "B",
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "5",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: null,
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "1",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: ["A", "F"],
    detail: "Field is required.",
    severity: "warning",
    object_id: "3",
    step_name: "species_not_null",
  },
  {
    code: "",
    field: ["C", "D", "F"],
    detail: "Invalid value provided.",
    severity: "warning",
    object_id: "4",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "D"],
    detail: "Field is required.",
    severity: "error",
    object_id: "5",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "C"],
    detail: "Value is not allowed.",
    severity: "error",
    object_id: "7",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["B", "D"],
    detail: "Field is required.",
    severity: "warning",
    object_id: "1",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "C", "D", "E"],
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "6",
    step_name: "value_not_allowed",
  },
  {
    code: "",
    field: ["A", "B", "E", "F"],
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "10",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: "D",
    detail: "Species cannot be null.",
    severity: "warning",
    object_id: "5",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["A", "F"],
    detail: "Field is required.",
    severity: "error",
    object_id: "6",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["C", "D", "E", "F"],
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "1",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: ["C", "F"],
    detail: "Field is required.",
    severity: "error",
    object_id: "2",
    step_name: "a_third_because_why_not",
  },
  {
    code: "",
    field: null,
    detail: "Field is required.",
    severity: "warning",
    object_id: "8",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: ["B", "F"],
    detail: "Species cannot be null.",
    severity: "error",
    object_id: "2",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: "A",
    detail: "Invalid value provided.",
    severity: "warning",
    object_id: "2",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: ["C", "F"],
    detail: "Species cannot be null.",
    severity: "error",
    object_id: "8",
    step_name: "and_a_fourth",
  },
  {
    code: "",
    field: null,
    detail: "Invalid value provided.",
    severity: "error",
    object_id: "5",
    step_name: "and_a_fourth",
  },
];

function FileValidation(props: Props) {
  const {
    endpoint,
    validationConfig,
    pageTitle = "File Validation / Manifest Validation",
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
  const [expandedModalResults, setExpandedModalResults] = useState<
    string | null
  >(null);
  const [validationProgress, setValidationProgress] = useState<number>(0);
  const [userFileValidationUploads, setUserFileValidationUploads] = useState<
    any[]
  >([]);
  const [showPassedSteps, setShowPassedSteps] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<boolean>(false);

  const ds = new TsDataSource();
  const { id } = getUserFromLocalStorage();

  useEffect(() => {
    fetchAndNormaliseAllUploadResults(
      ds,
      "local/upload",
      id,
      setUserFileValidationUploads,
      setErrors,
      setLoading
    );
  }, []);

  const generateMessages = async () => {
    const pipeline_data = {
      data: {
        s3_url: "made up url",
        s3_filename: "made up file name",
        spreadsheet_config: "made up config",
        pipeline_name: "tos_manifest_validation",
        destination: "made up destination",
      },
    };
    const res = await httpClient().post("/run-pipeline", pipeline_data, {
      params: {},
    });
    return res;
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
        <ValidateSteps
          data={data.map((item) => ({
            code: item.code,
            field: Array.isArray(item.field)
              ? item.field.join(", ")
              : item.field,
            detail: item.detail,
            severity: item.severity as severityType,
            objectId: item.object_id,
            stepName: item.step_name,
          }))}
        />
      )}
    </div>
  );

  const ResultsModalContent = (
    <div className="tol-file-validation-previous-uploads-modal-container tol-file-validation-scrollbar-fix">
      {userFileValidationUploads ? (
        userFileValidationUploads.map((upload, index) => (
          <div
            key={upload.id}
            className="tol-file-validation-previous-uploads-inner-container"
          >
            <PreviousUploads
              key={upload.id}
              data={userFileValidationUploads[index]}
              id={upload.id}
              expanded={expandedModalResults === upload.id}
              onToggle={handleToggleUploadResults}
              showPassedSteps={showPassedSteps}
            />
          </div>
        ))
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3>Previous Validations</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "fit-content",
          marginLeft: "auto",
        }}
      >
        <p style={{ margin: 0 }}>Show passed steps</p>
        <Toggle
          key="passed-steps-toggle"
          checked={showPassedSteps}
          onChange={() => setShowPassedSteps((prev) => !prev)}
        />
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
      />
    </div>
  );

  const helpModal = (
    <div>
      <Modal
        open={openModal === "help"}
        onClose={() => setOpenModal(false)}
        setOpen={setOpenModal}
        onEnter={() => {}}
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
