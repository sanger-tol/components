/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useCallback, useRef } from "react";
import { Table as RSTable } from "rsuite";
import {
  Placeholder,
  useEffectUpdate,
  DownloadModal,
  UtilityBar,
  ColumnConfigDrawer,
  IFieldMeta,
  IDropdownButtonConfig,
  useStateFallback,
  IRemoteTargetAndZone,
  PUtilityBar,
  PButton,
  PDeprecatedDropdownButtons,
  useBoard,
  ITableConfigSave,
  RowCounter,
  RowExpander,
  TFieldDropdownChoices,
  TCellHeights,
  RowToolsColumn,
  DataColumn,
  mergeUtilityBarConfigs,
  getTableRowClassName,
  getTableRowHeight,
  NoAttributesPlaceholder,
  IConfigDifferences,
  TableResetConfirmationModal,
  Pagination,
  ITableRecord,
  TFilterOrUndefined,
  IDataComponentBasics,
} from "..";

export interface PTable extends IRemoteTargetAndZone, IDataComponentBasics {
  data: any;
  fieldMeta: IFieldMeta;
  baseFieldMeta?: Partial<IFieldMeta>;
  filter: TFilterOrUndefined;
  filterVisibility?: boolean;
  setFilterVisibility?: any;
  sortByAttribute?: string;
  sortByType?: any;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  onSortColumn?: (dataKey: string, sortType?: "asc" | "desc") => void;
  resizeableColumns?: boolean;
  noFilter?: boolean;
  noSorting?: boolean;
  noPagination?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  rowSelection?: boolean;
  rowExpansion?: boolean;
  expandedRows?: string[];
  groupBy?: boolean;
  actions?: IDropdownButtonConfig[];
  actionChoices?: string[];
  actionsFooter?: IDropdownButtonConfig;
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;
  copySeparator?: string;
  fieldDropdownChoices?: TFieldDropdownChoices;
  onConfigSave: (config: ITableConfigSave) => void;
  onResizeColumn?: (columnWidth?: number, dataKey?: string) => void;
  downloadInProgress: boolean;
  setDownloadInProgress: (downloadInProgress: boolean) => void;
  utilityBarConfig?: PUtilityBar;
  onReset?: () => void;
  showConfigReset?: boolean;
  resetConfigDifferences?: IConfigDifferences;
}

export function Table(props: PTable) {
  let {
    id,
    data,
    fieldMeta,
    baseFieldMeta,
    height,
    loading,
    resizeableColumns = false,
    page,
    pageSize,
    totalSize,
    filter,
    filterVisibility,
    setFilterVisibility,
    sortByAttribute,
    sortByType,
    defaultSortByAttribute,
    defaultSortByType,
    onSortColumn,
    expandedRows,
    groupBy,
    onResizeColumn,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    actions,
    actionsFooter,
    utilityBarConfig = {},
    onReset,
    showConfigReset,
    resetConfigDifferences,
  } = props;

  const { editMode } = useBoard();

  const [open, setOpen] = useState<boolean>(false);
  const [resetConfirmationOpen, setResetConfirmationOpen] =
    useState<boolean>(false);
  const [downloadOpen, setDownloadOpen] = useState<boolean>(false);
  const [cellHeights, setCellHeights] = useState<TCellHeights>({});
  const [heightExpandedRows, setHeightExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    [],
  );
  // @ts-ignore - temp turned off
  const [bulkSelect, setBulkSelect] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement | null>(null);

  // Check if there are no fields selected in the table
  const noFieldsSelected = fieldMeta?.order?.active?.length === 0;

  // Check if all rows are expanded
  const allRowsExpanded = (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((row: any) => !!(row?.key && heightExpandedRows[row.key]))
  );

  // Get the data for the selected rows
  const selectedRowData = selectedRows.map((row) => {
    const key = Object.keys(row)[0];
    return data.find((d: any) => d.key === key) ?? Object.values(row)[0];
  });

  // Row selection checkbox logic
  let checked = false;
  let indeterminate = false;

  if (selectedRows.length === data.length || bulkSelect) {
    checked = true;
  } else if (selectedRows.length === 0) {
    checked = false;
  } else if (selectedRows.length > 0 && selectedRows.length < data.length) {
    indeterminate = true;
  }

  useEffectUpdate(() => {
    checked = false;
    setSelectedRows([]);
  }, [page, pageSize, filter, sortByAttribute, sortByType]);

  // @ts-ignore
  const handleCheckAll = (value: any, checkedVal: boolean) => {
    const vals = checkedVal
      ? data.map((item: any) => {
        return { [item.key]: item };
      })
      : [];
    setSelectedRows && setSelectedRows(vals);
  };

  const handleCheck = (value: any, checkedVal: boolean) => {
    const vals = checkedVal
      ? [...selectedRows, value]
      : selectedRows.filter(
        (item) => Object.keys(item)[0] !== Object.keys(value)[0],
      );
    setSelectedRows(vals);
  };

  // Called by each AutoHeightCell when its size changes
  const handleCellHeightChange = useCallback(
    (rowId: string, columnId: string, height: number) => {
      if (!rowId || !columnId || !height) return;

      setCellHeights((prev) => {
        const prevRow = prev[rowId] ?? {};
        if (prevRow[columnId] === height) return prev;

        return {
          ...prev,
          [rowId]: {
            ...prevRow,
            [columnId]: height,
          },
        };
      });
    },
    [],
  );

  // Toggle expand/collapse for all rows in the table
  const handleToggleAllRowHeights = useCallback(() => {
    setHeightExpandedRows((prev) => {
      if (!Array.isArray(data) || data.length === 0) return {};

      const allExpanded = data.every(
        (row: any) => !!(row?.key && prev[row.key]),
      );

      if (allExpanded) {
        // collapse all
        return {};
      }

      // expand all
      const next: Record<string, boolean> = {};
      data.forEach((row: any) => {
        if (row?.key) {
          next[row.key] = true;
        }
      });
      return next;
    });
  }, [data]);

  const actionDropDownButtons = actions
    ?.filter(
      (button) =>
        !button.isVisibleAction || button.isVisibleAction(selectedRowData),
    )
    .map((button) => ({
      ...button,
      action: () => {
        button.action(selectedRowData, filter);
      },
      disabled: selectedRowData.length === 0 || button.disabled === true,
    }));

  const configButton: PButton = {
    visible: !noConfigModal,
    position: "right",
    type: "primary",
    testid: "table-config-button",
    tooltip: "Configure Table",
    onClick: () => {
      setOpen(true);
    },
    icon: "sliders",
    outline: true,
    disabled: loading,
  };

  const filterButton: PButton = {
    visible: !noFilter && fieldMeta.order.active.length !== 0 && editMode,
    position: "right",
    type: "primary",
    onClick: () => setFilterVisibility(!filterVisibility),
    icon: filterVisibility ? "eye-slash" : "eye",
    tooltip: filterVisibility ? "Hide Filters" : "Show Filters",
    outline: true,
  };

  const downloadButton: PButton = {
    visible: !noDownload,
    position: "right",
    type: "primary",
    tooltip: "Download the tables current state in various formats",
    onClick: () => setDownloadOpen(!downloadOpen),
    disabled: totalSize <= 0 || noFieldsSelected || loading,
    icon: "download",
    disabledTooltip:
      totalSize >= 1
        ? "Must have at least one row to download."
        : undefined,
    outline: true,
  };

  const actionDropdown: PDeprecatedDropdownButtons | undefined =
    actions && actions.length > 0
      ? {
        mainButtonIcon: {
          id: "actions",
          icon: "paper-plane",
          type: "primary",
          position: "right",
          outline: selectedRows.length === 0,
        },
        dropdownButtons: actionDropDownButtons,
        footer: actionsFooter,
        placement: "leftStart",
      }
      : undefined;

  const PaginationPicker = (
    <Pagination
      {...props}
      parentRef={ref}
    />
  );

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton,
        filterButton,
        actionDropdown,
        downloadButton,
      ],
      elements:
        !noPagination && noFieldsSelected ? [PaginationPicker] : [],
    }
  )

  const LoadingScreen = () => (
    <Placeholder
      loader
      opacity={0.8}
      squareCorners
      messagePosition="top"
    />
  )

  const customAttributeSelection =
    !editMode
      && ((baseFieldMeta?.order?.limitVisibility ?? fieldMeta?.order?.limitVisibility) === true)
      ? [
        ...((baseFieldMeta?.order?.active || fieldMeta.order.active) ?? []),
        ...((baseFieldMeta?.order?.inactive || fieldMeta.order.inactive) ?? []),
      ]
      : undefined;

  const contents =
    props.contents || (noFieldsSelected ? <NoAttributesPlaceholder /> : null);

  return (
    <div id={id} ref={ref} className="tol-table" style={{ height: height }}>
      <TableResetConfirmationModal
        open={resetConfirmationOpen}
        setOpen={setResetConfirmationOpen}
        setConfigOpen={setOpen}
        onReset={onReset}
        resetConfigDifferences={resetConfigDifferences}
      />
      <DownloadModal
        {...props}
        disabledTabs={["Image"]}
        size="sm"
        componentId={id}
        open={downloadOpen}
        setOpen={setDownloadOpen}
        requestedFields={fieldMeta?.order?.active}
        title={ubc.title}
        fieldMeta={fieldMeta}
      />
      <ColumnConfigDrawer
        {...props}
        title="Table Configuration"
        fieldMeta={fieldMeta}
        actions={actions}
        defaultSortByAttribute={defaultSortByAttribute}
        defaultSortByType={defaultSortByType}
        open={open}
        groupBy={groupBy}
        setOpen={setOpen}
        editMode={editMode}
        onReset={
          !noConfigModal && !editMode && showConfigReset
            ? () => setResetConfirmationOpen(true)
            : undefined
        }
        showConfigReset={!noConfigModal && !editMode && showConfigReset}
        customAttributeSelection={customAttributeSelection}
      />
      <UtilityBar id={id} {...ubc} />
      {contents || (
        <>
          <RowCounter {...props} />
          <div className="tol-table-inner">
            <RSTable
              bordered
              fillHeight
              wordWrap
              rowKey={"key"}
              data={data}
              headerHeight={!noFilter && filterVisibility ? 85 : 42}
              loading={loading}
              sortColumn={sortByAttribute}
              sortType={sortByType}
              onSortColumn={onSortColumn}
              expandedRowKeys={expandedRows}
              renderRowExpanded={RowExpander}
              shouldUpdateScroll={false}
              rowClassName={(rowData: ITableRecord) => getTableRowClassName(
                rowData,
                bulkSelect,
                selectedRows,
              )}
              rowHeight={(rowData: any) =>
                getTableRowHeight(rowData, cellHeights, heightExpandedRows)
              }
              renderLoading={LoadingScreen}
            >
              {/* Has to be a function as only rsuite components can be children on their Table */}
              {RowToolsColumn({
                ...props,
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
              })}
              {fieldMeta!.order.active.map((key: string) => {
                const field = fieldMeta.dataWithDefaults![key];
                if (!field) return null;

                const sortable: boolean =
                  (!noSorting && field.sort) ?? false;
                const filterable = !noFilter && !!field.filter;
                // Has to be a function as only rsuite components can be children on their Table
                return DataColumn({
                  ...props,
                  fieldKey: key,
                  field,
                  sortable,
                  filterable,
                  resizeable: resizeableColumns,
                  onResize: onResizeColumn,
                  handleCellHeightChange,
                });
              })}
            </RSTable>
          </div>
        </>
      )}
    </div>
  );
}
