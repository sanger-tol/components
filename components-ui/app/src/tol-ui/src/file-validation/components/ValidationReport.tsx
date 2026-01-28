/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Panel } from "rsuite";
import {
  Button,
  constructValidationReport,
  downloadFileFromS3,
  downloadReportFile,
  IAllValidationData,
  Modal,
  PIPELINE_DS,
  splitS3FilenameString,
} from "../..";

export interface PValidationReport {
  data: IAllValidationData | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  uploadStatus: string;
}

export function ValidationReport(props: PValidationReport) {
  const { data, open, setOpen, uploadStatus } = props;

  const validationReport = data ? constructValidationReport(data) : null;

  const ValidationReportHeader = (
    <>
      <h3>Validation Report</h3>
      <h6>{`Manifest: ${splitS3FilenameString(String(data?.s3Filename))}`}</h6>
    </>
  );

  const ValidationReportContent = (
    <div className="tol-file-validation-report-modal">
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
                  <strong>{`Upload Status: ${uploadStatus}`}</strong>
                </li>
                <li>
                  <strong>{`Date Started: ${new Date(
                    validationReport?.uploadDetails.dateStarted || 0
                  ).toLocaleString()}`}</strong>
                </li>
                <li>
                  <strong>{`Pipeline Name: ${validationReport?.uploadDetails.pipelineName}`}</strong>
                </li>
                <li>
                  <strong>
                    File:{" "}
                    <a
                      href="#"
                      onClick={() =>
                        downloadFileFromS3(
                          PIPELINE_DS,
                          data?.s3Bucket || "",
                          data?.s3Filename || ""
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
        <p>No validation issues found for this upload.</p>
      )}
      {validationReport?.issues &&
        Object.entries(validationReport.issues).map(([stepName, issues]) => (
          <div
            key={stepName}
            className="tol-file-validation-report-modal-result-panel"
          >
            <Panel header={`Step: ${stepName}`} bordered collapsible>
              {issues.map((issue, index) => (
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
      {!validationReport && <p>Cannot generate validation report...</p>}
    </div>
  );

  return (
    <Modal
      actionButton={
        <Button
          icon="download"
          tooltip={"Download Validation Report"}
          onClick={() => {
            downloadReportFile(data || {} as IAllValidationData);
          }}
        />
      }
      actionButtonInline
      open={open}
      setOpen={setOpen}
      header={ValidationReportHeader}
      children={ValidationReportContent}
    />
  );
}
