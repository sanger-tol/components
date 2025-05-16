/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IRemoteTarget } from "../models";
import { FormatTooltip, SourceTag, InfoTooltip } from "../index";
import { useEffect, useState } from "react";

interface Props extends IRemoteTarget {
  field: any;
}

export function EntityMetaTooltip(props: Props) {
  const { field, objectType, dataSource } = props;
  const [attributeDeatils, setAttributeDetails] = useState<object>({});

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      dataSource.getEntityMeta().then((meta) => {
        const attribute = meta.flatAttributes[objectType][field];
        if (attribute) {
          const atts = {
            "Authorative": attribute.authorative,
            "Available on Relationship": attribute.available_on_relationship,
            "Cardinality": attribute.cardinality,
            "Description": attribute.description,
            "Display Name": attribute.display_name,
            "Python Type": attribute.python_type,
            "Source": attribute.source ? <SourceTag source={attribute.source} className="tol-entity-meta-tool-tip-source" /> : <></>,
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
