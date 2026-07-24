/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  PAttributeTooltip,
  AttributeTooltip,
  getSourceColour,
  normaliseCaps,
} from "..";

export interface PAttributeTitle extends PAttributeTooltip {
  titleElement?: keyof JSX.IntrinsicElements;
  className?: string;
  rename?: string;
  /**
   * Optional attribute source, if not provided, will be fetched from the data source
   */
  source?: string;
}

export function AttributeTitle(props: PAttributeTitle) {
  const {
    attributeId,
    dataSource,
    titleElement: TitleElement = "p",
    className,
    rename,
    source,
  } = props;
  const [fieldSource, setSource] = useState<string | undefined>(source);
  const [fieldDisplayName, setFieldDisplayName] = useState<string | undefined>(
    undefined,
  );
  const [loaded, setLoaded] = useState<boolean>(!!source);

  useEffect(() => {
    if (source && rename) return;
    dataSource
      .getEntityMeta()
      .then((data) => {
        const attr = data.flatAttributes?.[props.objectType]?.[attributeId];
        if (attr) {
          setSource((prev) => prev ?? attr.source);
          setFieldDisplayName(attr.display_name);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="tol-attribute-title">
      <TitleElement className={className}>
        <AttributeTooltip
          {...props}
          element={
            <span
              className="tol-inline-source"
              style={{
                backgroundColor: loaded
                  ? getSourceColour(fieldSource || "var(--tol-emphasis)")
                  : "transparent",
              }}
            />
          }
        />
        {rename || fieldDisplayName || normaliseCaps(attributeId)}
      </TitleElement>
    </div>
  );
}
