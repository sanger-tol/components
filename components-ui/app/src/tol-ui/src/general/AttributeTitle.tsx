/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { PAttributeTooltip, AttributeTooltip, getSourceColour } from "..";

export interface PAttributeTitle extends PAttributeTooltip {
  titleElement?: keyof JSX.IntrinsicElements;
  classname?: string;
}

export function AttributeTitle(props: PAttributeTitle) {
  const { field, dataSource, titleElement: TitleElement = 'p', classname } = props;
  const [fieldSource, setSource] = useState<string | undefined>(undefined);
  const [fieldDisplayName, setFieldDisplayName] = useState<string | undefined>(undefined);

  useEffect(() => {
    dataSource.getEntityMeta()
    .then((data) => {
      setSource(data.flatAttributes[props.objectType][field].source);
      setFieldDisplayName(data.flatAttributes[props.objectType][field].display_name);
    })
  }, [])

  return (
    <TitleElement className={classname}>
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
      {fieldDisplayName || field}
    </TitleElement>
  );
}
