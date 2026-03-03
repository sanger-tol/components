/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import { Panel } from "rsuite";
import {
  Button,
  constructValidationReport,
  downloadFileFromS3,
  downloadReportFile,
  fetchAndNormaliseAllUploadResults,
  getUserFromLocalStorage,
  IAllValidationData,
  Modal,
  PIPELINE_DS,
  useQueryData,
  useValidationPolicyModule,
  VALIDATION_ENDPOINTS,
} from "../..";

export interface PValidationReport {
  /**
   * The data passed to the component.
   * It can either be a full object or an id object, which partially satisfies IAllValidationData
   */
  data: IAllValidationData[] | Partial<IAllValidationData>[];
  /**
   * The open state of the modal
   */
  open: boolean;
  /**
   * The state action to open/close the modal
   */
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function ValidationReport(props: PValidationReport) {
  const { open, setOpen } = props;

  const { policies } = useValidationPolicyModule();
  const user = getUserFromLocalStorage();

  // Check if the first object has the expected properties
  // If it does not, we know it's a table action
  const hasRequiredAttributes = (
    data: IAllValidationData[] | Partial<IAllValidationData>[],
  ): boolean => {
    if (data.length === 0) return false;
    return typeof data[0] === "object" && "validationStatus" in data[0];
  };
  const hasCompleteData = hasRequiredAttributes(props.data);

  const fetchPipelineData = async () => {
    if (!props.data) {
      return null;
    }

    const result = await fetchAndNormaliseAllUploadResults(
      PIPELINE_DS,
      VALIDATION_ENDPOINTS.UPLOAD,
      {
        and_: {
          id: {
            in_list: {
              value: props.data.flatMap((item: { id: string }) => item.id),
            },
          },
        },
      },
    );

    return result;
  };

  const fetchedResults = useQueryData<IAllValidationData[] | null>(
    ["uploadResults", user.id],
    fetchPipelineData,
    {
      // Fetch only if an ID is present and the modal is open
      enabled: !hasCompleteData && open === true,
      staleTime: 0,
    },
  );

  // Determine which data to use (whichever is more complete)
  const data =
    fetchedResults.data && fetchedResults.isSuccess
      ? fetchedResults.data
      : props.data;

  const singleReport = data.length === 1;
  const ValidationReportHeader = (
    <h3>Validation Report{singleReport ? "" : "s"}:</h3>
  );

  const validationReportContent = (
    validationReport: any,
    validation: IAllValidationData,
    index: number,
  ) => {
    const validationPolicy = policies[
      validationReport?.uploadDetails.validationStatus
    ] || {
      textColor: "var(--tol-text)",
      rename: "Unknown Status",
    };
    return (
      <>
        <div>
          <Panel header="Upload Details" bordered collapsible>
            <div className="tol-file-validation-report-modal-details">
              <div>
                <ul>
                  <li>
                    <strong>{`Upload ID: ${validationReport?.uploadDetails.id}`}</strong>
                  </li>
                  <li>
                    <strong>{`Pipeline ID: ${validationReport?.uploadDetails.pipelineId}`}</strong>
                  </li>
                  <li>
                    <strong>
                      Upload Status:{" "}
                      <strong
                        style={{ color: `${validationPolicy.textColor}` }}
                      >{`${validationPolicy.rename}`}</strong>
                    </strong>
                  </li>
                  <li>
                    <strong>{`Date Started: ${new Date(
                      validationReport?.uploadDetails.dateStarted || 0,
                    ).toLocaleString()}`}</strong>
                  </li>
                  <li>
                    <strong>{`Pipeline Name: ${validationReport?.uploadDetails.pipelineName}`}</strong>
                  </li>
                  <li>
                    <strong>
                      Filename:{" "}
                      <a
                        href="#"
                        onClick={() =>
                          downloadFileFromS3(
                            PIPELINE_DS,
                            data?.[index]?.s3Bucket || "",
                            data?.[index]?.s3Filename || "",
                          )
                        }
                      >
                        {validationReport?.uploadDetails.s3Filename}
                      </a>
                    </strong>
                  </li>
                  <li>
                    <strong>
                      Steps in Pipeline:{" "}
                      {validationReport?.uploadDetails.pipelineSteps ||
                        "No steps available."}
                    </strong>
                  </li>
                  <li>
                    <strong>{`Rejection Reason: ${validationReport?.uploadDetails.rejectionReason || "None"}`}</strong>
                  </li>
                  <li>
                    <strong>{`System Failure Reason: ${validationReport?.uploadDetails.failureMessage || "None"}`}</strong>
                  </li>
                </ul>
              </div>
              <div>
                <ul></ul>
              </div>
            </div>
          </Panel>
        </div>
        <h5 className="tol-file-validation-report-modal-results">Issues:</h5>
        {Object.keys(validationReport?.issues || {}).length === 0 && (
          <p>Could not find any issues: {validationPolicy.rename}</p>
        )}
        {validationReport?.uploadDetails.failureMessage && (
          <p>
            A system issue has occurred and validation could not finish. Reason:{" "}
            {validationReport?.uploadDetails.failureMessage}
          </p>
        )}
        {validationReport?.issues &&
          Object.entries(validationReport.issues).map(([stepName, issues]) => (
            <div
              key={stepName}
              className="tol-file-validation-report-modal-result-panel"
            >
              <Panel header={`Step: ${stepName}`} bordered collapsible>
                {Array.isArray(issues) &&
                  issues.map((issue, index) => (
                    <div
                      key={`${stepName}-${index}`}
                      style={{ marginBottom: "15px" }}
                    >
                      <div>
                        <strong>{`[${issue.severity.toUpperCase()}] Column: ${
                          issue.field
                        }`}</strong>
                      </div>
                      <div>
                        <strong>Issue:</strong> {issue.detail}
                      </div>
                      <div>
                        <strong>Affected Row Number(s): </strong>
                        {issue.objectId}
                      </div>
                    </div>
                  ))}
              </Panel>
            </div>
          ))}
        {data.length > 0 && !singleReport && (
          <div className="tol-file-validation-report-download-button">
            <Button
              text="Download"
              icon="download"
              tooltip={"Download Validation Report"}
              onClick={() => {
                downloadReportFile(validation || ({} as IAllValidationData));
              }}
            />
          </div>
        )}
      </>
    );
  };

  const validationReports = (
    validationData: IAllValidationData[] | null | undefined,
  ) => {
    if (!validationData || validationData.length === 0) {
      return fetchedResults.isLoading ? (
        <p>Loading validation data...</p>
      ) : (
        <h6>No Report Data Found...</h6>
      );
    }

    return validationData?.map(
      (validation: IAllValidationData, index: number) => {
        const validationReport = constructValidationReport(validation);
        return (
          <div
            key={`${validation.id}-${index}`}
            className="tol-file-validation-report-modal"
          >
            {!singleReport ? (
              <Panel
                header={`Upload: ${validation?.uploadName}`}
                bordered
                collapsible
              >
                {validationReportContent(validationReport, validation, index)}
              </Panel>
            ) : (
              <div>
                <h6>{`Upload: ${validation?.uploadName}`}</h6>
                {validationReportContent(validationReport, validation, index)}
              </div>
            )}
            {!validationReport && <p>Cannot generate validation report...</p>}
          </div>
        );
      },
    );
  };

  return (
    <Modal
      // Show the action button only if a single data point is provided
      actionButton={
        singleReport ? (
          <Button
            text="Download"
            icon="download"
            tooltip={"Download Validation Report"}
            onClick={() => {
              downloadReportFile(data[0] || ({} as IAllValidationData));
            }}
          />
        ) : undefined
      }
      actionButtonInline
      open={open}
      setOpen={setOpen}
      header={ValidationReportHeader}
      children={validationReports(data)}
    />
  );
}
