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

  const ds = new TsDataSource({baseUrl: baseUrl});
  useEffect(() => {
    ds.getEntityMeta().then((meta) => {
      const attribute = meta.flatAttributes[endpoint][field];
      if (attribute) {
        const atts = {
          "Authorative": attribute.authorative,
          "Available on Relationship": attribute.available_on_relationship,
          "Cardinality": attribute.cardinality,
          "Description": attribute.description,
          "Display Name": attribute.display_name,
          "Python Type": attribute.python_type,
          "Source": <SourceTag source={attribute.source} className="tol-entity-meta-tool-tip-source" />,
        }
        setAttributeDetails(atts);
      }
    });
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
