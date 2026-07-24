/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FormatTooltip, SourceTag, IconTooltip, IRemoteTarget, IZone } from "..";
import { AttributeStatsBox } from "./AttributeStatsBox";
import type { ReactNode } from "react";

export interface PAttributeTooltip extends IRemoteTarget {
  attributeId: string;
  element?: ReactNode;
  id?: string;
  componentId?: string;
  zone?: IZone;
}

export function AttributeTooltip(props: PAttributeTooltip) {
  const {
    attributeId: field, element, objectType, dataSource, id, componentId, zone } = props;

  const [details, setDetails] = useState<Record<string, ReactNode>>({});
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setDetails({});

      dataSource.getEntityMeta().then((meta) => {
        const attribute = meta.flatAttributes[objectType][field];
        if (attribute) {
          setDetails({
            "Authorative": attribute.authorative,
            "Available on Relationship": attribute.available_on_relationship,
            "Cardinality": attribute.cardinality,
            "Description": attribute.description,
            "Display Name": attribute.display_name,
            "Python Type": attribute.python_type,
            "Source": attribute.source && (
              <SourceTag
                source={attribute.source}
                className="tol-attribute-tooltip-source"
              />
            ),
            "System Name": field
          });
        } else {
          setDetails({"System Name": field});
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [dataSource, field, objectType]);

  const Tooltip = <FormatTooltip contents={details} />;

  // Render the tooltip with no contents if there are no details to show, to avoid flickering on first load
  if (Object.keys(details).length === 0) {
    return <IconTooltip icon={element} contents={undefined} />;
  }

  const tooltipContents = (
    <div>
      {Tooltip}
      <AttributeStatsBox
        {...props}
        componentId={componentId ?? id}
        zone={zone}
      />
    </div>
  );

  return (
    <IconTooltip
      icon={element}
      contents={tooltipContents}
    />
  );
}
