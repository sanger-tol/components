/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { copyToClipboard, Icon, normaliseCaps, ReadOnlyFilters, TsDataSource } from "..";
import type { IFilter } from "..";

export interface PTitleTooltip {
  /**
   * The ID of the thing (e.g. Component or Zone) that this tooltip is displayed on
   * */
  id?: any;
  title: string;
  objectType: string;
  dataSource: TsDataSource;
  filter?: IFilter;
}

export function TitleTooltip(props: PTitleTooltip) {
  const {
    id,
    title,
    objectType,
    dataSource,
    filter,
  } = props;

  const Id = (
    <p>
      <b>ID:</b> {id}
      &nbsp;
      <Icon
        icon="copy"
        tooltip="Copy"
        onClick={() => copyToClipboard(id)}
      />
    </p>
  );

  return (
    <div className="tol-utility-bar-title-tooltip">
      {title && <h6>{title}</h6>}
      <p><b>Object Type:</b> {normaliseCaps(objectType!)}</p>
      <b>Filters:</b>
      &nbsp;
      <ReadOnlyFilters
        filter={filter}
        objectType={objectType!}
        dataSource={dataSource!}
      />
      {id && Id}
    </div>
  )
}
