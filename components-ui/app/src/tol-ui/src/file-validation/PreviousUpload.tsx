/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import ValidationIcon from "./ValidationIcon";
import { determineStepHasErrors } from "./utils";
import { Button } from "../general";
import { normaliseCaps } from "src/general/utils";

interface Props {
  data: any[];
}

// TODO: Add date, s3_filename to database
// TODO: Fill in fake values from DB, e.g. id, s3_url, pipeline_name, complete

const id = "73498";
const pipeline_name = "Example Pipeline";
const complete = true;
const s3_filename = "manfiest_abc123.xlsx";
const date = "2025-01-01";
// results

function PreviousUploads(props: Props) {
  const { data } = props;
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div
      style={{
        minHeight: "40px",
        margin: "10px 0px",
        border: "1px solid var(--tol-emphasis",
        borderRight: "3px solid var(--tol-emphasis",
        borderLeft: "3px solid var(--tol-emphasis",
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
            icon="chevron-up"
            onClick={() => setExpanded(!expanded)}
            className={`tol-file-uploader-previous-dropdown-btn-icon-transition 
                tol-file-uploader-previous-validations-dropdown-btn ${
                  expanded ? "icon-rotate" : ""
                }`}
            tooltip="Expand"
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
        <p style={{ margin: "0px" }}>{s3_filename}</p>
        <p style={{ color: complete ? "green" : "red", margin: "0px" }}>
          {complete ? "Completed" : "Incomplete"}
        </p>
      </div>

      <div
        className={`tol-file-uploader-previous-validation-results-container ${
          expanded ? "expanded" : ""
        }`}
      >
        <h6>Results:</h6>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          {data.map((step) => (
            <div key={step.id}>
              {
                <ValidationIcon
                  tooltip={normaliseCaps(step.stepName)}
                  iconType={determineStepHasErrors(step) ? "xmark" : "check"}
                  size="lg"
                  className={`tol-file-uploader-validate-step-icon ${
                    determineStepHasErrors(step) ? "error" : "passed"
                  }`}
                />
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreviousUploads;
