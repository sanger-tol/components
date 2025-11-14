/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FormatTooltip, SourceTag, IRemoteTarget, IconTooltip } from "..";

export interface PAttributeTooltip extends IRemoteTarget {
  attributeId: string;
  element?: React.ReactNode;
}

export function AttributeTooltip(props: PAttributeTooltip) {
  const { attributeId: field, element, objectType, dataSource } = props;

  const [details, setDetails] = useState<Record<string, React.ReactNode>>({});

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
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
  }, [field]);

  const Tooltip = <FormatTooltip contents={details} />;

  if (Object.keys(details).length === 0) return <></>;

  return (
    <IconTooltip
      icon={element}
      contents={Tooltip}
    />
  );
}
