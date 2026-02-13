/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState, useCallback } from "react";
import { Table as RSTable, Pagination, SelectPicker } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import {
  Placeholder,
  useEffectUpdate,
  DownloadModal,
  UtilityBar,
  resizeListener,
  ColumnConfigDrawer,
  FieldMeta,
  IDropdownButtonConfig,
  useStateFallback,
  IRemoteTargetAndZone,
  PUtilityBar,
  PButton,
  PDropdownButtons,
  useBoard,
  ITableConfigSave,
  RowCounter,
  RowExpander,
  TFieldDropdownChoices,
  DEFAULT_ROW_HEIGHT,
  TCellHeights,
  COLLAPSED_ROW_MAX_HEIGHT,
  RowToolsColumn,
  DataColumn,
} from "..";


export interface PTable extends IRemoteTargetAndZone {
  id: string;
  data: any;
  fieldMeta: FieldMeta;
  height: any;
  loading: boolean;
  resizeableColumns?: boolean;
  source?: string;

  page: number;
  setPage: any;
  pageSize: number;
  setPageSize: any;
  totalSize: number;
  displaySource?: boolean;

  filterVisibility?: boolean;
  setFilterVisibility?: any;

  sortByAttribute?: string;
  sortByType?: any;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  onSortColumn?: (dataKey: string, sortType?: "asc" | "desc") => void;

  filter: any;
  copySeparator?: string;
  fieldDropdownChoices?: TFieldDropdownChoices;

  onConfigSave: (config: ITableConfigSave) => void;
  onResizeColumn?: (columnWidth?: number, dataKey?: string) => void;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  rowSelection?: boolean;
  rowExpansion?: boolean;

  actions?: IDropdownButtonConfig[];
  actionChoices?: string[];
  actionsFooter?: IDropdownButtonConfig;
  utilityBarConfig?: PUtilityBar;
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;
  expandedRows?: string[];

  contents?: ReactNode;
  groupBy?: boolean;

  downloadInProgress: boolean;
  setDownloadInProgress: (downloadInProgress: boolean) => void;
}

export function Table(props: PTable) {
  let {
    /* eslint-disable */
    id,
    data,
    fieldMeta,
    height,
    loading,
    resizeableColumns = false,
    source,

    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
    displaySource,

    filterVisibility,
    setFilterVisibility,

    sortByAttribute,
    sortByType,
    defaultSortByAttribute,
    defaultSortByType,
    onSortColumn,
    filter,
    expandedRows,

    onResizeColumn,

    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    actions,
    actionsFooter,
    utilityBarConfig = {},
    contents,
    groupBy
    /* eslint-enable */
  } = props;

  const { editMode } = useBoard();

  const [open, setOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);
  const [mediumBreakpoint, setMediumBreakpoint] = useState(true);
  const [cellHeights, setCellHeights] = useState<TCellHeights>({});
  const [heightExpandedRows, setHeightExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    []
  );

  // @ts-ignore - temp turned off
  const [bulkSelect, setBulkSelect] = useState(false);

  let checked = false;
  let indeterminate = false;
  noFilter = !!noFilter;

  const noFieldsSelected = fieldMeta?.order?.active?.length === 0;
  const wrapperId = "tol-table-wrapper-" + id;

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

  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) {
      setSmallBreakpoint(width < 800);
      setMediumBreakpoint(width < 1000);
    }
  });

  // @ts-ignore
  const handleCheckAll = (value: any, checkedVal: boolean) => {
    const keys = checkedVal ? data.map((item: any) => item.key) : [];
    setSelectedRows && setSelectedRows(keys);
  };

  const handleCheck = (value: any, checkedVal: boolean) => {
    const keys = checkedVal
      ? [...selectedRows, value]
      : selectedRows.filter((item) => item !== value);
    setSelectedRows(keys);
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
    []
  );

  // Toggle expand/collapse for all rows in the table
  const handleToggleAllRowHeights = useCallback(() => {
    setHeightExpandedRows((prev) => {
      if (!Array.isArray(data) || data.length === 0) return {};

      const allExpanded = data.every(
        (row: any) => !!(row?.key && prev[row.key])
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

  const actionDropDownButtons = actions?.map((button) => ({
    ...button,
    action: () => {
      button.action(selectedRows, filter);
    },
    disabled: selectedRows.length === 0,
  }));

  const configButton: PButton = !noConfigModal
    ? {
      visible: true,
      position: "right",
      type: "primary",
      testid: "table-slider-button",
      tooltip: "Configure Table",
      onClick: () => {
        setOpen(true);
      },
      icon: "sliders",
      outline: true,
      disabled: loading,
    }
    : {
      visible: false,
    };

  const filterButton: PButton =
    (!noFilter && fieldMeta.order.active.length !== 0 && editMode) ? {
      visible: true,
      position: "right",
      type: "primary",
      onClick: () => {
        setFilterVisibility(!filterVisibility);
      },
      icon: filterVisibility ? "eye-slash" : "eye",
      tooltip: filterVisibility ? "Hide Filters" : "Show Filters",
      outline: true,
    } : {
      visible: false,
    };

  const downloadButton: PButton = !noDownload
    ? {
      visible: true,
      position: "right",
      type: "primary",
      tooltip: "Download the tables current state in various formats",
      onClick: () => {
        setDownloadOpen(!downloadOpen);
      },
      disabled: totalSize <= 0 || noFieldsSelected || loading,
      icon: "download",
      disabledTooltip:
        totalSize >= 1
          ? "Must have at least one row to download."
          : undefined,
      outline: true,
    }
    : {
      visible: false,
    };

  const actionDropdown: PDropdownButtons | undefined =
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

  const allRowsExpanded = (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (row: any) => !!(row?.key && heightExpandedRows[row.key])
    )
  );

  return (
    <div style={{ height: height }} className="tol-table" id={wrapperId}>
      <DownloadModal
        {...props}
        size="sm"
        open={downloadOpen}
        setOpen={setDownloadOpen}
        source={source}
        requestedFields={fieldMeta?.order?.active}
        title={utilityBarConfig.title}
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
        displaySource={displaySource}
        // fetches all if inactive isn't specified
        customAttributeSelection={
          fieldMeta.order.inactive && fieldMeta.order.inactive.length > 0
            ? [...(fieldMeta.order.active ?? []), ...fieldMeta.order.inactive]
            : undefined
        }
      />
      <UtilityBar
        id={id}
        {...utilityBarConfig}
        title={utilityBarConfig.title}
        elements={
          !noPagination && fieldMeta?.order?.active?.length > 0
            ? [
              <span className="tol-page-size">
                {!smallBreakpoint && editMode && (
                  <SelectPicker
                    value={pageSize}
                    onChange={setPageSize}
                    size="sm"
                    cleanable={false}
                    searchable={false}
                    data={[
                      { label: "25", value: 25 },
                      { label: "50", value: 50 },
                      { label: "100", value: 100 },
                      { label: "250", value: 250 },
                    ]}
                  />
                )}
              </span>,
              <Pagination
                className="tol-pagination"
                size="sm"
                layout={mediumBreakpoint ? ["pager"] : ["pager", "skip"]}
                total={totalSize <= 10000 ? totalSize : 10000}
                activePage={page}
                onChangePage={setPage}
                limit={pageSize}
                onChangeLimit={setPageSize}
                prev
                next
                first={!mediumBreakpoint}
                last={!mediumBreakpoint}
                ellipsis={!mediumBreakpoint}
                boundaryLinks
                maxButtons={mediumBreakpoint ? 1 : 3}
              />,
              ...(utilityBarConfig.elements || []),
            ]
            : [...(utilityBarConfig.elements || [])]
        }
        buttons={[
          ...(utilityBarConfig.buttons || []),
          configButton,
          filterButton,
          actionDropdown,
          downloadButton,
        ]}
      />
      {contents ? (
        contents
      ) : (
        <>
          {noFieldsSelected ? (
            <Placeholder
              message={
                <>
                  {/* Assume that when privilege is undefined, the table is not in a board */}
                  {editMode ? (
                    <>
                      No fields selected. Please click
                      <FontAwesomeIcon
                        icon={faSliders}
                        size="lg"
                        style={{ padding: "0 10" }}
                      />
                      to configure.
                    </>
                  ) : (
                    <>No fields available.</>
                  )}
                </>
              }
              height={height}
            />
          ) : (
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
                  rowClassName={(rowData: any) => {
                    if (rowData) {
                      if (bulkSelect) {
                        return "tol-selected-row disabled";
                      } else if (
                        selectedRows.some((item) => item === rowData.key)
                      ) {
                        return "tol-selected-row";
                      }
                    }
                    return "";
                  }}
                  rowHeight={(rowData: any) => {
                    const rowId = rowData?.key;
                    const row = cellHeights[rowId];
                    const fullHeight = row
                      ? Math.max(DEFAULT_ROW_HEIGHT, ...Object.values(row))
                      : DEFAULT_ROW_HEIGHT;

                    if (heightExpandedRows[rowId]) {
                      return fullHeight;
                    }
                    return Math.min(fullHeight, COLLAPSED_ROW_MAX_HEIGHT);
                  }}
                  renderLoading={() => (
                    <Placeholder loader opacity={0.8} squareCorners />
                  )}
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
        </>
      )}
    </div>
  );
}