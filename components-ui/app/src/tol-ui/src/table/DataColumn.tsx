/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Table as RSTable } from "rsuite";
import {
  AttributeTitle,
  Filter,
  IFilterInputType,
  Sort,
  FieldDropdown,
  AutoHeightCell,
  PTable,
  IField,
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
  PopUpMessage,
} from "..";


// static map to track last width per column
// state and ref fails
const lastWidths = new Map<string, number>();

export interface PDataColumn extends PTable {
  fieldKey: string;
  field: IField;
  sortable: boolean;
  filterable: boolean;
  resizeable?: boolean;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
  handleCellHeightChange: (
    rowId: string,
    columnId: string,
    height: number
  ) => void;
}

export function DataColumn(props: PDataColumn) {
  const {
    id,
    data,
    fieldKey,
    sortable,
    filterable,
    resizeable = false,
    filterVisibility,
    copySeparator,
    fieldDropdownChoices,
    handleCellHeightChange,
  } = props;

  const field = {
    width: DEFAULT_COLUMN_WIDTH,
    ...props.field,
  };

  const { Column, HeaderCell, Cell } = RSTable;

  // table and field unique key
  const columnKey = `${id}:${fieldKey}`;

  const onResize = (columnWidth?: number, dataKey?: string) => {
    if (!columnWidth || !dataKey) return;

    if (columnWidth > MAX_COLUMN_WIDTH) {
      PopUpMessage({
        type: "info",
        message: "Maximum column width has been reached",
      });
    };

    let clampedWidth = Math.min(
      Math.max(columnWidth, MIN_COLUMN_WIDTH),
      MAX_COLUMN_WIDTH
    );

    const lastWidth = lastWidths.get(columnKey);

    // Ignore updates that would not actually change anything.
    if (lastWidth === clampedWidth) return;

    lastWidths.set(columnKey, clampedWidth);
    props.onResize?.(clampedWidth, dataKey);
  };

  return (
    <Column
      key={fieldKey}
      resizable={resizeable}
      onResize={onResize}
      width={field.width}
      sortable={sortable}
      fixed={field.fixed}
      minWidth={MIN_COLUMN_WIDTH}
    >
      <HeaderCell>
        <AttributeTitle
          {...props}
          attributeId={fieldKey}
          className="tol-header-text"
          rename={field.rename!}
          source={field.source}
        />
        {filterable && (
          <span
            className={
              filterVisibility ? "tol-filter" : "tol-filter-hide"
            }
          >
            <Filter
              {...props}
              attribute={fieldKey}
              rename={field.rename!}
              type={field.filter as IFilterInputType}
              componentId={id}
            />
          </span>
        )}
        <Sort
          {...props}
          attribute={fieldKey}
          sortable={sortable}
        />
        {!field.custom && (
          <FieldDropdown
            {...props}
            attribute={fieldKey}
            data={data}
            separator={copySeparator}
            choices={fieldDropdownChoices}
          />
        )}
      </HeaderCell>
      <Cell dataKey={fieldKey}>
        {(rowData: any) => (
          <AutoHeightCell
            rowId={rowData?.key}
            columnId={fieldKey}
            onHeightChange={handleCellHeightChange}
          >
            {rowData[fieldKey]}
          </AutoHeightCell>
        )}
      </Cell>
    </Column>
  );
}