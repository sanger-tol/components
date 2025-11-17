/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReadOnlyFilters } from "src/attributes";
import { TsDataSource } from "src/datasource";
import { normaliseCaps } from "src/general";

interface PTitleTooltip {
  title: string;
  objectType: string;
  dataSource: TsDataSource;
  filter: JSX.Element;
  description: string;
}

export function TitleTooltip(props: PTitleTooltip) {
  const { title, objectType, dataSource, filter, description } = props;

  const isAnyPropNotUndefined = title || objectType || filter || description;

  return isAnyPropNotUndefined && (
    <div>
      <h5>{title}</h5>
      <p><b>Object Type:</b> {normaliseCaps(objectType)}</p>
      <p><b>Filters:</b></p>
      <ReadOnlyFilters
        filter={filter}
        objectType={objectType}
        dataSource={dataSource}
      />
      {/* {description} */}
    </div>
  )
}
