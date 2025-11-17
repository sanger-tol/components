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
    <ul className="tol-read-only-filters">
      {filterDescriptions && Object.entries(filterDescriptions).map(([attributeId, proses]) => (
        <li className="tol-read-only-filter">
          <AttributeTitle
            objectType={objectType}
            dataSource={dataSource}
            attributeId={attributeId}
          />
          {proses.map((prose, index) => <>
            &nbsp;{prose}{index != proses.length - 1 && " and"}
          </>)}
        </li>
      ))}
    </ul>
  )
}
