/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InfoIcon } from "./Icons";
import { TsDataSource, FormatTooltip } from "../index";
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
      setEntityMeta(meta.flatAttributes[endpoint][field]);
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
