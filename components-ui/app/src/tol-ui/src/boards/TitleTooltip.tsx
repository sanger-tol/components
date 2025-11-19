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
}

export function TitleTooltip(props: PTitleTooltip) {
  const { title, objectType, dataSource, filter } = props;

  return (
    <div>
      <h6>{title}</h6>
      <hr style={{"margin": "0.4em 0"}} />
      <p><b>Object Type:</b> {normaliseCaps(objectType)}</p>
      <span>
        <b>Filters:</b>
        &nbsp;
        <ReadOnlyFilters
          filter={filter}
          objectType={objectType}
          dataSource={dataSource}
        />
      </span>
    </div>
  )
}
