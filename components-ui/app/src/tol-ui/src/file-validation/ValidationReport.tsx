/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  downloadFileFromS3,
  IPipelineUpload,
  IValidationResult,
  Modal,
  PIPELINE_DS,
} from "..";

export interface PValidationReport {
  data: IPipelineUpload | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  uploadStatus: string;
}

export function ValidationReport(props: PValidationReport) {
  const { data, open, setOpen, uploadStatus } = props;
  console.log(data);

  const ValidationReportHeader = (
    <h3>{`Validation Report for Pipeline #${data?.id}`}</h3>
  );

  const ValidationReportContent = (
    <div className="tol-file-validation-report-modal">
      <h5>Details:</h5>
      <div className="tol-file-validation-report-modal-details">
        <div>
          <ul>
            <li>
              <h6>{`Upload ID: ${data?.id}`}</h6>
            </li>
            <li>
              <h6>{`Pipeline ID: ${data?.pipelineId}`}</h6>
            </li>
            <li>
              <h6>{`Upload Status: ${uploadStatus}`}</h6>
            </li>
            <li>
              <h6>{`Date Started: ${new Date(
                data?.dateStarted || 0
              ).toLocaleString()}`}</h6>
            </li>
          </ul>
        </div>
        <div>
          <ul>
            <li>
              <h6>{`Pipeline Name: ${data?.pipelineName}`}</h6>
            </li>
            <li>
              <h6>
                File:{" "}
                <a
                  href="#"
                  onClick={() =>
                    downloadFileFromS3(
                      PIPELINE_DS,
                      data?.s3Url || "",
                      data?.s3Filename || ""
                    )
                  }
                >
                  {data?.s3Filename}
                </a>
              </h6>
            </li>
            <li>
              <h6>
                Steps in Pipeline:{" "}
                {data?.pipelineSteps?.join(", ") || "No steps available."}
              </h6>
            </li>
          </ul>
        </div>
      </div>
      <h5 className="tol-file-validation-report-modal-results">Results:</h5>
      <p className="tol-file-validation-report-modal-details-para">
        Any steps not shown here have 0 validation errors or warnings.
      </p>
      {data?.pipelineSteps?.map((step, index) => {
        return (
          <div key={`step-${step}-${index}`}>
            {data?.validationResults?.some(
              (result) => result.stepName === step
            ) && <h6>{`Step: ${step} - `}</h6>}
            {data?.validationResults
              ?.filter((result) => result.stepName === step)
              .sort((result1, result2) => {
                if (result1.severity !== result2.severity) {
                  return result1.severity === "error" ? -1 : 1;
                }
                return Number(result1.objectId) - Number(result2.objectId);
              })
              .map((result: IValidationResult, index) => {
                return (
                  <div key={`result-${index}`}>
                    <p className="tol-file-validation-report-modal-details-detail">{`${result.severity}: Row ${result.objectId} - Column(s): ${result.field} - ${result.detail}`}</p>
                  </div>
                );
              })}
          </div>
        );
      }) || <h6>No steps available.</h6>}
    </div>
  );
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={ValidationReportHeader}
      children={ValidationReportContent}
    />
  );
}
