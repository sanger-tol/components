/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  HoverOverlay,
  FormatTooltip,
  Loader,
  TsDataSource,
  mapKeysToDisplayNames,
  API_METHODS,
} from "..";


interface Props {
  attribute: string;
  data: string; // Relationship Data
  detail?: boolean;
  entityMeta?: any;
  dataSource: TsDataSource;
}

export function Relationship(props: Props) {
  const { attribute, data, detail, entityMeta, dataSource } = props;
  const [contents, setContents] = useState<JSX.Element | string>(
    <Loader size="sm" />,
  );
  const resource = data["type"] + "/" + data["id"];

  const loadRelationship = () => {
    dataSource
      .custom({
        method: API_METHODS.GET,
        resource
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
    return <a href={data["type"]}>{box}</a>;
  }

  return box;
}
