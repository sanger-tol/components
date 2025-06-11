/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useParams, useLocation } from "react-router-dom";
import ValidateSteps from "./ValidateSteps";
import { Widgets } from "../index";

interface LocationState {
  data: any;
  pipelineId: string;
  pipelineName: string;
  complete: boolean;
  s3Filename: string;
  date: string;
}

// TDOO: fetch validation results if not provided in location state
// TODO: Calc number of errors/warnings/passes and display

function ValidationResultsViewer() {
  const location = useLocation<LocationState>();
  const { data, pipelineId, pipelineName, complete, s3Filename, date } =
    location.state || {};

  const Results = (
    <div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Results for Pipeline #{pipelineId}</h4>{" "}
          <div>
            <h4 style={{ color: complete ? "green" : "red" }}>
              {complete ? "Completed" : "Incomplete"}
            </h4>
            <p style={{ textAlign: "right" }}>{date}</p>
          </div>
        </div>
        <div style={{ maxWidth: "150px" }}>
          <h6>{pipelineName}</h6>
          <a href="#">
            <p>{s3Filename}</p>
          </a>
        </div>
      </div>
      <ValidateSteps data={data} />
    </div>
  );

  const ResultsViewer = [
    {
      component: Results,
      type: "full",
    },
  ];

  return <Widgets components={ResultsViewer} />;
}

export default ValidationResultsViewer;
