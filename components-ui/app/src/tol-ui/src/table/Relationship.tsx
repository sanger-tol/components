/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { httpClient } from "../services/http/httpClient";
import { HoverOverlay, FormatTooltip } from "../general";
import { Loader } from "../index";
import { normaliseCaps } from "../general/Utils";

export interface Props {
  attribute: string;
  data: string; // Relationship Data
  detail?: boolean;
  baseUrl?: string;
  entityMeta?: any;
}

function Relationship(props: Props) {
  const { attribute, data, detail, baseUrl, entityMeta } = props;
  const [contents, setContents] = useState<JSX.Element | string>(
    <Loader size="sm" />,
  );
  const endpoint = "/" + data["type"] + "/" + data["id"];

  function mapKeysToDisplayNames(
    data: any,
    displayNames: any
  ): object {
    const result: object = {};
    for (const key in data) {
      if (displayNames[key] && displayNames[key].display_name) {
        result[displayNames[key].display_name] = data[key];
      } else {
        result[normaliseCaps(key)] = data[key]; // Fallback to original key if no display_name exists
      }
    }

    return result;
  }

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
        const contentsToDisplay = mapKeysToDisplayNames(apiData["attributes"], entityMeta.flatAttributes[data["type"]]);

        setContents(<FormatTooltip contents={contentsToDisplay} />);
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
