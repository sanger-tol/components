/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import { Table as RSTable, Checkbox } from "rsuite";
import {
  TCellHeights,
  DEFAULT_ROW_HEIGHT,
  COLLAPSED_ROW_MAX_HEIGHT,
  RowHeightExpandIcon,
  PTable,
  hasExpandableRows,
  ROW_TOOLS_COLUMN_MAX_WIDTH,
  ROW_TOOLS_COLUMN_SINGLE_ITEM_WIDTH,
} from "..";

export interface PRowToolsColumn extends PTable {
  data: any[];
  checked: boolean;
  indeterminate: boolean;
  bulkSelect: boolean;
  selectedRows: string[];
  cellHeights: TCellHeights;
  heightExpandedRows: Record<string, boolean>;
  allRowsExpanded: boolean;
  handleCheckAll: (value: any, checked: boolean) => void;
  handleCheck: (value: any, checked: boolean) => void;
  setHeightExpandedRows: Dispatch<SetStateAction<Record<string, boolean>>>;
  handleToggleAllRowHeights: () => void;
}

export function RowToolsColumn(props: PRowToolsColumn) {
  const {
    data,
    checked,
    indeterminate,
    bulkSelect,
    selectedRows,
    cellHeights,
    heightExpandedRows,
    allRowsExpanded,
    handleCheckAll,
    handleCheck,
    setHeightExpandedRows,
    handleToggleAllRowHeights,
    rowSelection,
  } = props;

  const { Column, HeaderCell, Cell } = RSTable;

  const getColumnWidth = () => {
    let width = 0;
    if (rowSelection) width += ROW_TOOLS_COLUMN_SINGLE_ITEM_WIDTH;
    if (hasExpandableRows(data, cellHeights))
      width += ROW_TOOLS_COLUMN_SINGLE_ITEM_WIDTH;
    // cap at max width
    return Math.min(width, ROW_TOOLS_COLUMN_MAX_WIDTH);
  };

  return (
    <Column fixed key="rowTools" width={getColumnWidth()}>
      <HeaderCell>
        <div className="tol-row-tools-header">
          {rowSelection && (
            <Checkbox
              className="tol-table-row-selection"
              checked={checked}
              indeterminate={indeterminate}
              disabled={bulkSelect || data.length === 0}
              onChange={handleCheckAll}
              style={data.length === 0 ? { display: "none" } : {}}
            />
          )}
          {hasExpandableRows(data, cellHeights) && (
            <RowHeightExpandIcon
              expanded={allRowsExpanded}
              onClick={handleToggleAllRowHeights}
            />
          )}
        </div>
      </HeaderCell>
      <Cell>
        {(rowData: any) => {
          const rowId = rowData.key;
          const row = cellHeights[rowId];
          const fullHeight = row
            ? Math.max(DEFAULT_ROW_HEIGHT, ...Object.values(row))
            : DEFAULT_ROW_HEIGHT;
          const isExpanded = !!heightExpandedRows[rowId];
          const canExpand = fullHeight > COLLAPSED_ROW_MAX_HEIGHT;

          const toggleExpand = () => {
            if (!canExpand) return;
            setHeightExpandedRows((prev) => ({
              ...prev,
              [rowId]: !prev[rowId],
            }));
          };

          return (
            <div className="tol-row-tools-cell">
              {rowSelection && (
                <Checkbox
                  className="tol-table-row-selection"
                  value={{ [rowId]: rowData }}
                  checked={
                    bulkSelect ||
                    selectedRows.some((row) => Object.keys(row)[0] === rowId)
                  }
                  disabled={bulkSelect}
                  onChange={handleCheck}
                />
              )}
              {canExpand && (
                <RowHeightExpandIcon
                  expanded={isExpanded}
                  onClick={toggleExpand}
                />
              )}
            </div>
          );
        }}
      </Cell>
    </Column>
  );
}
