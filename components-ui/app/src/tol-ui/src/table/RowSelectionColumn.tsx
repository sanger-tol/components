import { Dispatch, SetStateAction } from "react";
import { Table as RSTable, Checkbox } from "rsuite";
import {
  Icon,
  TCellHeights,
  DEFAULT_ROW_HEIGHT,
  COLLAPSED_ROW_MAX_HEIGHT,
} from "..";


export interface RowSelectionColumnProps {
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

export function RowSelectionColumn(props: RowSelectionColumnProps) {
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
  } = props;

  const { Column, HeaderCell, Cell } = RSTable;

  return (
    <Column key="rowSelection" width={40}>
      <HeaderCell>
        <div className="tol-row-select-header">
          <Checkbox
            className="tol-table-row-selection"
            checked={checked}
            indeterminate={indeterminate}
            disabled={bulkSelect || data.length === 0}
            onChange={handleCheckAll}
            style={data.length === 0 ? { display: "none" } : {}}
          />
          {Array.isArray(data) && data.length > 0 && (
            <Icon
              icon={
                allRowsExpanded
                  ? "down-left-and-up-right-to-center"
                  : "up-right-and-down-left-from-center"
              }
              className="tol-row-expand-btn"
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
            <div className="tol-row-select-cell">
              <Checkbox
                className="tol-table-row-selection"
                value={rowId}
                checked={
                  bulkSelect ||
                  selectedRows.some((item) => item === rowId)
                }
                disabled={bulkSelect}
                onChange={handleCheck}
              />
              {canExpand && (
                <Icon
                  icon={
                    isExpanded
                      ? "down-left-and-up-right-to-center"
                      : "up-right-and-down-left-from-center"
                  }
                  className="tol-row-expand-btn"
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