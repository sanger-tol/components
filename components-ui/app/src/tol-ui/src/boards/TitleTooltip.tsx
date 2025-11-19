/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReadOnlyFilters, TsDataSource, normaliseCaps, IFilter } from "..";

interface PTitleTooltip {
  title: string;
  objectType: string;
  dataSource: TsDataSource;
  filter?: IFilter;
}

export function TitleTooltip(props: PTitleTooltip) {
  const { title, objectType, dataSource, filter } = props;

  return (
    <div>
      <h6>{title}</h6>
      <hr style={{"margin": "0.4em 0"}} />
      <p><b>Object Type:</b> {normaliseCaps(objectType)}</p>
      <>
        <b>Filters:</b>
        &nbsp;
        <ReadOnlyFilters
          filter={filter}
          objectType={objectType}
          dataSource={dataSource}
        />
      </>
    </div>
  )
}
