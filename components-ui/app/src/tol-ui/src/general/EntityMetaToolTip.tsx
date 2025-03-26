/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, FormatTooltip, SourceTag, InfoTooltip } from "../index";
import { useEffect, useState } from "react";

export interface Props {
  baseUrl?: string;
  field: any;
  endpoint: string;
}

function EntityMetaTooltip(props: Props) {
  const { baseUrl, field, endpoint } = props;
  const [attributeDeatils, setAttributeDetails] = useState<object>({});

  const ds = new TsDataSource({ baseUrl: baseUrl });
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      ds.getEntityMeta().then((meta) => {
        const attribute = meta.flatAttributes[endpoint][field];
        if (attribute) {
          const atts = {
            Authorative: attribute.authorative,
            Available_On_Relationship: attribute.available_on_relationship,
            Cardinality: attribute.cardinality,
            Description: attribute.description,
            Display_Name: attribute.display_name,
            Python_Type: attribute.python_type,
            source: <SourceTag source={attribute.source} className="tol-entity-meta-tool-tip-source" />,
          }
          setAttributeDetails(atts);
        }
    })};
    return () => { isMounted = false };
  }, [field]);

  const tooltip = <FormatTooltip contents={attributeDeatils} />;

  if (Object.keys(attributeDeatils).length === 0) {
    return <></>;
  }
  return (
    <InfoTooltip contents={tooltip} />
  )
}

export default EntityMetaTooltip;
