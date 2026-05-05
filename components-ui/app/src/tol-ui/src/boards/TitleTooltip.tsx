/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReadOnlyFilters, normaliseCaps, IZone } from "..";


export function TitleTooltip(props: IZone) {
  const {
    title,
    object_type,
    dataspace,
    filter
  } = props;

  return (
    <div className="tol-utility-bar-title-tooltip">
      <h6>{title}</h6>
      <p><b>Object Type:</b> {normaliseCaps(object_type!)}</p>
      <>
        <b>Filters:</b>
        &nbsp;
        <ReadOnlyFilters
          filter={filter}
          objectType={object_type!}
          dataSource={dataspace!}
        />
      </>
    </div>
  )
}
