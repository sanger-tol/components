/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { determineStepHasErrors, Step, ValidationIcon } from "./index";
import { useHistory } from "react-router-dom";
import { Button, HoverOverlay } from "../general";
import { normaliseCaps } from "../general/utils";

interface Props {
  data: Step[];
  id: string;
  expanded: boolean;
  onToggle: (id: string) => void;
}

// TODO: Add date, s3_filename to database
// TODO: Fill in fake values from DB, e.g. id, s3_url, pipeline_name, complete

const pipeline_name = "Example Pipeline";
const complete = true;
const s3_filename = "manfiest_abc123.xlsx";
const date = "2025-01-01";
// results

function PreviousUploads(props: Props) {
  const { data, id, expanded, onToggle } = props;

  const history = useHistory();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  function goToResults(pipelineId: string) {
    history.push(`/file-validation/results/${pipelineId}`, {
      data: data,
      pipelineId: pipelineId,
      pipelineName: pipeline_name,
      complete: complete,
      s3Filename: s3_filename,
      date: date,
    });
  }

  return (
    <div
      style={{
        minHeight: "40px",
        margin: "10px 0px",
        border: "1px solid var(--tol-emphasis",
        borderRight: "3px solid var(--tol-emphasis)",
        borderLeft: "3px solid var(--tol-emphasis)",
        padding: "10px 15px",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          alignContent: "center",
          alignItems: "center",
          justifyItems: "center",
          marginTop: "5px",
        }}
      >
        <h6 style={{ alignSelf: "center", margin: "0px" }}>
          ID: #{id} - {pipeline_name}
        </h6>
        <div style={{ display: "flex" }}>
          {" "}
          <p style={{ margin: "0px", alignSelf: "center", marginRight: "5px" }}>
            {date}
          </p>
          <Button
            icon="chevron-down"
            onClick={() => onToggle(id)}
            className={`tol-file-uploader-previous-dropdown-btn-icon-transition 
                tol-file-uploader-previous-validations-dropdown-btn ${
                  expanded ? "icon-rotate" : ""
                }`}
            tooltip={expanded ? "Collapse" : "Expand"}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <a href="#">
          <p style={{ margin: "0px" }}>
            {<HoverOverlay contents={"download"}>{s3_filename}</HoverOverlay>}
          </p>
        </a>
        <p style={{ color: complete ? "green" : "red", margin: "0px" }}>
          {complete ? "Completed" : "Incomplete"}
        </p>
      </div>
      <div
        className={`tol-file-uploader-previous-validation-results-container ${
          expanded ? "expanded" : ""
        }`}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h6>Results:</h6>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {data.map((step) => (
                <div
                  key={step.id}
                  onClick={() => {
                    determineStepHasErrors(step) &&
                      setExpandedId(expandedId === step.id ? null : step.id);
                  }}
                >
                  {
                    <ValidationIcon
                      tooltip={`${normaliseCaps(step.stepName)} - ${
                        step.errors && step.errors.length > 1
                          ? step.errors.length
                          : ""
                      } ${
                        step.errors && step.errors.length > 1
                          ? "errors"
                          : "Passed"
                      }`}
                      iconType={
                        determineStepHasErrors(step) ? "xmark" : "check"
                      }
                      size="lg"
                      className={`tol-file-uploader-validate-step-icon ${
                        determineStepHasErrors(step) ? "error" : "passed"
                      }`}
                    />
                  }
                </div>
              ))}
            </div>
            <div>
              <Button text="View Results" onClick={() => goToResults(id)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousUploads;
