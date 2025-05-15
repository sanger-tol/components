/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Header,
  ObjectDetail,
  RemoteGet,
  Widgets,
  env,
  formatDate,
  Timeline,
} from "../tol-ui/src";
import { useParams } from "react-router-dom";
import { useState } from "react";

export function DetailInfo() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState();

  if (response === null) {
    return <Header title="Species not found." pageEmpty />;
  }

  if (response === undefined) {
    return (
      <RemoteGet
        endpoint={"species/" + id}
        baseUrl={env.TOL_DATA}
        loadingMessage="Loading species..."
        response={response}
        setResponse={setResponse}
      />
    );
  } else {
    const attributes = response!["data"]["data"]["attributes"];
    const detail = (
      <>
        <h1 className="mb-3">{attributes["sts_scientific_name"]}</h1>
        <ObjectDetail
          data={{
            "Taxonomy ID": attributes["uid"],
            "Common Name": attributes["sts_common_name"],
            Family: attributes["sts_family"],
            "Order Group": attributes["sts_order_group"],
            "ToLID Prefix": attributes["sts_prefix"],
            "Pacbio Submission Date": formatDate(
              attributes["sts_pacbio_submitted_date"],
            ),
          }}
        />
      </>
    );

    const timeline = (
      <Timeline
        id={id!}
        title={`Timeline of events for ${attributes["sts_scientific_name"]}`}
        data={{
          "Comliance in Progress": {
            date: attributes["sts_sample_sts_submit_date_min"],
          },
          "Approved to Ship": {
            date: attributes["sts_sample_sts_accept_date_min"],
          },
          "Arrived at Sanger": {
            date: attributes["sts_sample_sts_receive_date_min"],
          },
          "Released to Lab": {
            date: attributes["sts_sample_benchling_date_assigned_to_lab_min"],
          },
          "Assembly Complete": {
            date: attributes["grit_curation_grit_open_date_min"],
          },
          Curation: { date: attributes["grit_curation_grit_done_date_min"] },
          "ToLA / Grit Submission": {
            date: attributes["grit_curation_grit_in_submission_date_min"],
          },
          "PacBio Submission": {
            date: attributes[
              "benchling_sequencing_request_benchling_completion_date_pacbio_min"
            ],
          },
          "PacBio Extracted": {
            date: attributes["mlwh_run_data_mlwh_run_complete_pacbio_min"],
          },
          "RNASeq Submission": {
            date: attributes[
              "benchling_sequencing_request_benchling_completion_date_rnaseq_min"
            ],
          },
          "RNASeq Extracted": {
            date: attributes["mlwh_run_data_mlwh_run_complete_rnaseq_min"],
          },
          "HiC Submission": {
            date: attributes[
              "benchling_sequencing_request_benchling_completion_date_hic_min"
            ],
          },
        }}
        defaultIcon
      />
    );

    const components = [
      {
        component: detail,
        type: "full",
      },
      {
        component: timeline,
        type: "full",
      },
    ];

    return <Widgets components={components} />;
  }
}
