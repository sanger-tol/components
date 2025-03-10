/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InfoIcon } from "./Icons";
import { TsDataSource, FormatTooltip, SourceTag } from "../index";
import { useEffect, useState } from "react";
import HoverOverlay from "./HoverOverlay";


export interface Props {
  baseUrl?: string;
  field: any;
  endpoint: string;
}

function EntityMetaTooltip(props: Props) {
  const { baseUrl, field, endpoint } = props;
  const [entityMeta, setEntityMeta] = useState<any>(null);

  const ds = new TsDataSource({baseUrl: baseUrl});
  useEffect(() => {
    ds.getEntityMeta().then((meta) => {
      const fieldDetails = meta.flatAttributes[endpoint][field];
      const atts = {
        Authorative: fieldDetails.authorative,
        Available_On_Relationship: fieldDetails.available_on_relationship,
        Cardinality: fieldDetails.cardinality,
        Description: fieldDetails.description,
        Display_Name: fieldDetails.display_name,
        Python_Type: fieldDetails.python_type,
        source: <SourceTag source={fieldDetails.source} className="tol-entity-meta-tool-tip-source" />,
      }

      setEntityMeta(atts);
    });
  }, [field]);

  const formatted = <FormatTooltip contents={entityMeta} />;

  return(
    <HoverOverlay
        placement="auto"
        contents={formatted}
        delay={250}
      >
        <div className="tooltip-wrapper">
          <InfoIcon />
        </div>
    </HoverOverlay>
  );
}

export default EntityMetaTooltip;
