/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  PCell,
  HoverOverlay,
  FormatTooltip,
  Loader,
  TDataObjectOrNull,
  sortObjectAlphabetically,
} from "../..";


export interface PRelationship extends PCell {
  detailPageIdAttribute?: string; // the id that the detail page uses
}

export function Relationship(props: PRelationship) {
  const { attribute, value, dataObject, dataSource, detailPageIdAttribute } = props;
  const [contents, setContents] = useState<JSX.Element | string>(
    <Loader size="sm" />,
  );

  const splitKey = attribute.split(".");
  const relationship = splitKey[splitKey.length - 2];
  const relationshipObjectType = dataObject?.relationships?.[relationship]?.objectType;

  /*
    currently ignores null data entries
    fetchRelationships not fetching here, only caching
    -- needs improving in the future
  */
  const loadRelationship = async () => {
    dataSource
      ?.attributeMetadata().then(async (am: any) => {
        await dataObject?.fetchRelationships?.[relationship]
          .then((relDataObject: TDataObjectOrNull) => {
            const data = {};
            Object.entries(am[relationshipObjectType!]).map(([key, meta]: any) => {
              if (relDataObject?.[key]) {
                data[meta.display_name] = relDataObject?.[key];
              }
            });
            
            setContents(
              <FormatTooltip
                contents={sortObjectAlphabetically(data)}
              />
            );
          });
      })
      .catch((error: any) => {
        setContents(`Error: ${error.message}`);
      })
  };

  if (!relationshipObjectType) return <></>;

  const Box = (
    <HoverOverlay
      placement="auto"
      contents={contents}
      onHover={() => loadRelationship()}
      delay={250}
    >
      <div className="link-box">{value}</div>
    </HoverOverlay>
  );

  if (detailPageIdAttribute) {
    return (
      <a href={`${relationship}/${detailPageIdAttribute}`}>
        {Box}
      </a>
    );
  }

  return Box;
}
