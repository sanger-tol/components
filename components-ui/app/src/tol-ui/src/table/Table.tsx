/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState, useCallback } from "react";
import { Table as RSTable, Pagination, SelectPicker } from "rsuite";
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
  mergeUtilityBarConfigs,
  NoAttributesPlaceholder,
  Modal,
  Button,
  BUTTONS,
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
  onReset?: () => void;
  showConfigReset?: boolean;
  resetConfigColumnCount?: number;
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
    /* eslint-enable */
  } = props;

  const groupBy: boolean | undefined = props.groupBy;
  const onReset: (() => void) | undefined = props.onReset;
  const showConfigReset: boolean | undefined = props.showConfigReset;
  const resetConfigColumnCount: number | undefined = props.resetConfigColumnCount;

  const { editMode } = useBoard();

  const [open, setOpen] = useState(false);
  const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);
  const [mediumBreakpoint, setMediumBreakpoint] = useState(true);
  const [cellHeights, setCellHeights] = useState<TCellHeights>({});
  const [heightExpandedRows, setHeightExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    [],
  );

  // @ts-ignore - temp turned off
  const [bulkSelect, setBulkSelect] = useState(false);

  let checked = false;
  let indeterminate = false;
  noFilter = !!noFilter;

  const noFieldsSelected = fieldMeta?.order?.active?.length === 0;
  const selectedColumnCount = fieldMeta?.order?.active?.length ?? 0;
  const resetColumnCount = resetConfigColumnCount ?? selectedColumnCount;
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

  const selectedRowData = selectedRows.map((row) => {
    const key = Object.keys(row)[0];
    return data.find((d: any) => d.key === key) ?? Object.values(row)[0];
  });
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

    const configButton: PButton = !noConfigModal?
     {
      visible: true,
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
    } : {
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

  const allRowsExpanded =
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (row: any) => !!(row?.key && heightExpandedRows[row.key])
    );

  const PageSizePicker = (
    <span className="tol-page-size">
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
    </span>
  );

  const PaginationPicker = (
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
    />
  )

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
        !noPagination && fieldMeta?.order?.active?.length > 0 ? [
          ...(!smallBreakpoint && editMode ? [PageSizePicker] : []),
          PaginationPicker,
        ] : [],
    }
  )

  return (
    <div style={{ height: height }} className="tol-table" id={wrapperId}>
      <Modal
        hasPendingChanges
        open={resetConfirmationOpen}
        setOpen={setResetConfirmationOpen}
        size="xs"
        closeButton={false}
      >
        <h5>Reset Table Configuration</h5>
        <p>
          Are you sure you want to reset this table to the published configuration?
        </p>
        <p>
          The published configuration currently has {resetColumnCount} {" "}
          {resetColumnCount === 1 ? "column" : "columns"}.
        </p>
        <p className="tol-danger-colour">
          Warning: Your current table configuration will be lost.
        </p>
        <Button
          {...BUTTONS.CONFIRM}
          onClick={() => {
            setResetConfirmationOpen(false);
            setOpen(false);
            onReset?.();
          }}
          testid="confirm-reset-button"
        />
        <Button
          {...BUTTONS.CANCEL}
          onClick={() => setResetConfirmationOpen(false)}
        />
      </Modal>
      <DownloadModal
        {...props}
        disabledTabs={['Image']}
        size="sm"
        componentId={id}
        open={downloadOpen}
        setOpen={setDownloadOpen}
        source={source}
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
        displaySource={displaySource}
        onReset={
          !noConfigModal && !editMode && showConfigReset
            ? () => setResetConfirmationOpen(true)
            : undefined
        }
        showConfigReset={!noConfigModal && !editMode && showConfigReset}
        // fetches all if inactive isn't specified
        customAttributeSelection={
          fieldMeta.order.inactive && fieldMeta.order.inactive.length > 0
            ? [...(fieldMeta.order.active ?? []), ...fieldMeta.order.inactive]
            : undefined
        }
      />
      <UtilityBar id={id} {...ubc} />
      {contents ? (
        contents
      ) : (
        <>
          {noFieldsSelected ? <NoAttributesPlaceholder /> : (
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
                        selectedRows.some(
                          (item) => Object.keys(item)[0] === rowData.key,
                        )
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
                      ? Math.max(
                          DEFAULT_ROW_HEIGHT,
                          ...Object.values(row),
                        )
                      : DEFAULT_ROW_HEIGHT;

                    if (heightExpandedRows[rowId]) {
                      return fullHeight;
                    }
                    return Math.min(fullHeight, COLLAPSED_ROW_MAX_HEIGHT);
                  }}
                  renderLoading={() => (
                    <Placeholder
                      loader
                      opacity={0.8}
                      squareCorners
                      message={editMode ? "Entering edit mode" : undefined}
                      messagePosition="top"
                    />
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
