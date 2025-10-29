/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { PAttributeTooltip, AttributeTooltip, getSourceColour, normaliseCaps } from "..";

export interface PAttributeTitle extends PAttributeTooltip {
  titleElement?: keyof JSX.IntrinsicElements;
  className?: string;
  rename?: string;
}

export function AttributeTitle(props: PAttributeTitle) {
  const { field, dataSource, titleElement: TitleElement = 'p', className, rename } = props;
  const [fieldSource, setSource] = useState<string | undefined>(undefined);
  const [fieldDisplayName, setFieldDisplayName] = useState<string | undefined>(undefined);

  useEffect(() => {
    dataSource.getEntityMeta()
      .then((data) => {
        const attr = data.flatAttributes?.[props.objectType]?.[field];
        if (attr) {
          setSource(attr.source);
          setFieldDisplayName(attr.display_name);
        }
      })
  }, [])

  return (
    <div className="tol-attribute-title">
      <TitleElement className={className}>
        <AttributeTooltip
          {...props}
          element={
            <span
              className="inline-source"
              style={{
                backgroundColor: getSourceColour(
                  fieldSource || "var(--tol-emphasis)"
                ),
              }}
            />
          }
        />
        {rename || fieldDisplayName || normaliseCaps(field)}
      </TitleElement>
    </div>
  );
}
