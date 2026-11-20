/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FormatTooltip, SourceTag, IconTooltip, IRemoteTarget, IZone, BooleanStatus } from "..";
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
    attributeId: field,
    element,
    objectType,
    dataSource,
    id,
    componentId,
    zone
  } = props;

  const [details, setDetails] = useState<Record<string, ReactNode>>({});

  const SourceTags = (sources?: string | string[]) => {
    // Normalize single sources and source lists so both render as individual tags.
    const sourceList = Array.isArray(sources) ? sources : sources ? [sources] : [];

    return (
      <>
        {sourceList.map((source, index) => (
        <SourceTag
          key={`${source}-${index}`}
          source={source}
          className="tol-attribute-tooltip-source"
        />
        ))}
      </>
    );
  };

  useEffect(() => {
    let cancelled = false;
    setDetails({});

    dataSource
      .getAttributeDescriptor({ objectType, field }).then((attribute) => {
        if (cancelled) return;

        if (attribute) {
          setDetails({
            "Display Name": attribute.display_name,
            "System Name": field,
            "Description": attribute.description,
            "Python Type": attribute.python_type,
            "Cardinality": attribute.cardinality,
            "Source": attribute.source ? SourceTags(attribute.source) : undefined,
            "Source Order": attribute.source_order?.length
              ? SourceTags(attribute.source_order)
              : undefined,
            "Authoritative": <BooleanStatus mini value={attribute.authoritative} />,
            "Available on Relationships": <BooleanStatus mini value={attribute.available_on_relationships} />,
          });
        } else {
          setDetails({ "System Name": field });
        }
      });

    return () => {
      cancelled = true;
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
