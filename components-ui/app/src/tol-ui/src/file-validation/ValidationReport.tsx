/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Panel } from "rsuite";
import {
  aggregateObjectIdsByIssue,
  downloadFileFromS3,
  formatAndConcatObjectIds,
  IPipelineUpload,
  Modal,
  PIPELINE_DS,
  splitS3FilenameString,
  truncateString,
} from "..";

export interface PValidationReport {
  data: IPipelineUpload | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  uploadStatus: string;
}

export function ValidationReport(props: PValidationReport) {
  const { data, open, setOpen, uploadStatus } = props;

  const ValidationReportHeader = (
    <h3>{`Validation Report for Pipeline #${data?.id}`}</h3>
  );

  const ValidationReportContent = (
    <div className="tol-file-validation-report-modal">
      <div>
        <Panel header="Upload Details" bordered collapsible>
          <div className="tol-file-validation-report-modal-details">
            <div>
              <ul>
                <li>
                  <strong>{`Upload ID: ${data?.id}`}</strong>
                </li>
                <li>
                  <strong>{`Pipeline ID: ${data?.pipelineId}`}</strong>
                </li>
                <li>
                  <strong>{`Upload Status: ${uploadStatus}`}</strong>
                </li>
                <li>
                  <strong>{`Date Started: ${new Date(
                    data?.dateStarted || 0
                  ).toLocaleString()}`}</strong>
                </li>
                <li>
                  <strong>{`Pipeline Name: ${data?.pipelineName}`}</strong>
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
                      {truncateString(
                        splitS3FilenameString(String(data?.s3Filename)),
                        30
                      )}
                    </a>
                  </strong>
                </li>
                <li>
                  <strong>
                    Steps in Pipeline:{" "}
                    {data?.pipelineSteps?.join(", ") || "No steps available."}
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
      {data?.validationResults && data?.validationResults.length === 0 && (
        <p>No validation issues found for this upload.</p>
      )}
      {data?.pipelineSteps?.map((step) => {
        const stepErrors = data.validationResults.filter(
          (result) => result.stepName === step
        );

        if (stepErrors.length === 0) return null;

        const aggregatedResults = aggregateObjectIdsByIssue(stepErrors);

        return (
          <div
            key={step}
            className="tol-file-validation-report-modal-result-panel"
          >
            <Panel header={`Step: ${step}`} bordered collapsible>
              {Object.entries(aggregatedResults).map(([k, objectIds]) => {
                const [severity, field, detail] = k.split("|~", 3);
                const sortedObjectIds = [...objectIds].sort(
                  (a, b) => Number(a) - Number(b)
                );
                return (
                  <div key={k} style={{ marginBottom: "15px" }}>
                    <div>
                      <strong>{`[${severity.toUpperCase()}] Column: ${field}`}</strong>
                    </div>
                    <div>
                      <strong>Issue:</strong> {detail}
                    </div>
                    <div>
                      <strong>Affected Row Number(s): </strong>
                      {`${formatAndConcatObjectIds(sortedObjectIds)}`}
                    </div>
                  </div>
                );
              })}
            </Panel>
          </div>
        );
      }) || <p>Cannot find any pipeline steps...</p>}
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
