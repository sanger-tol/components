/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter, IRemoteTarget } from "src/interfaces";
import { AttributeTitle } from "./AttributeTitle";
import { generateFilterDescriptions } from "./utils";

interface PReadOnlyFilters extends IRemoteTarget {
  filter: IFilter
}

export function ReadOnlyFilters(props: PReadOnlyFilters) {
  const { filter, objectType, dataSource } = props;

  const filterDescriptions = generateFilterDescriptions(filter);

  return (
    <div className="tol-read-only-filters">
      {filterDescriptions && Object.entries(filterDescriptions).map(([attributeId, prose]) => (
        <div className="tol-read-only-filter">
          <AttributeTitle
            objectType={objectType}
            dataSource={dataSource}
            attributeId={attributeId}
          />
          &nbsp;{prose}
        </div>
      ))}
    </div>
  )
}
