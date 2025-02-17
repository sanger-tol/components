/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { httpClient } from "../services/http/httpClient";
import { HoverOverlay, FormatTooltip } from "../general";
import { Loader } from "../index";

export interface Props {
  attribute: string;
  data: string;
  detail?: boolean;
  baseUrl?: string;
}

function Relationship(props: Props) {
  const { attribute, data, detail, baseUrl } = props;
  const [contents, setContents] = useState<JSX.Element | string>(
    <Loader size="sm" />,
  );
  const endpoint = "/" + data["type"] + "/" + data["id"];

  const loadRelationship = () => {
    httpClient()
      .get(endpoint, {
        baseURL: baseUrl,
      })
      .then((res: any) => {
        // error if endpoint doesn't return 200
        if (res.status !== 200) {
          throw Error();
        }
        const apiData = res.data.data;
        setContents(<FormatTooltip contents={apiData["attributes"]} />);
      })
      .catch((error: any) => {
        setContents("Object cannot be found: " + error.message);
      });
  };

  if (data["id"] === null || data["id"] === "") return <></>;

  const box = (
    <HoverOverlay
      placement="auto"
      contents={contents}
      onHover={() => loadRelationship()}
      delay={250}
    >
      <div className="link-box">{data["attributes"][attribute]}</div>
    </HoverOverlay>
  );

  if (detail) {
    return <a href={endpoint}>{box}</a>;
  }

  return box;
}

export default Relationship;
