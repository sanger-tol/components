/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Header,
  ObjectDetail,
  RemoteGet,
  Widgets,
  formatDate,
  TOL_DS,
} from "../../tol-ui/src";

export function DetailInfo() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState();

  if (response === null) {
    return <Header title="Species not found." pageEmpty />;
  }

  if (response === undefined) {
    return (
      <RemoteGet
        resource={"species/" + id}
        dataSource={TOL_DS}
        loadingMessage="Loading species..."
        response={response}
        setResponse={setResponse}
      />
    );
  } else {
    const id = response!["data"]["data"]["id"];
    const attributes = response!["data"]["data"]["attributes"];
    const detail = (
      <>
        <h1 className="mb-3">{attributes["sts_scientific_name"]}</h1>
        <ObjectDetail
          data={{
            "Taxonomy ID": id,
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

    const components = [
      {
        component: detail,
        type: "full",
      },
    ];

    return <Widgets components={components} />;
  }
}
