/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState } from "react";
import { Table as RSTable, Pagination, SelectPicker, Checkbox } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import {
  Placeholder,
  useEffectUpdate,
  DownloadModal,
  UtilityBar,
  resizeListener,
  ColumnConfigDrawer,
  Filter,
  IFilterInputType,
  FieldMeta,
  IDropdownButtonConfig,
  useStateFallback,
  IRemoteTargetAndZone,
  PUtilityBar,
  PButton,
  PDropdownButtons,
  useBoardPrivilege,
  PRIVILEGE,
  ITableConfigSave,
  RowCounter,
  RowExpander,
  AttributeTitle,
} from "..";
import { Sort } from "./Sort";
import { FieldDropdown } from "./FieldDropdown";

export type NumRows = 25 | 50 | 100 | 250 | 1000;

interface Props extends IRemoteTargetAndZone {
  id: string;
  data: any;
  fieldMeta: FieldMeta;
  height: any;
  loading: boolean;

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
  handleSortColumn: any;
  filter: any;
  copySeparator?: string;

  onConfigSave: (config: ITableConfigSave) => void;

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

export function Table(props: Props) {
  const { Column, HeaderCell, Cell } = RSTable;
  let {
    /* eslint-disable */
    id,
    data,
    fieldMeta,
    height,
    loading,
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
    handleSortColumn,
    filter,
    expandedRows,
    copySeparator,

    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    rowSelection,
    actions,
    actionsFooter,
    utilityBarConfig = {},
    contents,
    groupBy
    /* eslint-enable */
  } = props;

  const { privilege } = useBoardPrivilege();

  const [open, setOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);
  const [mediumBreakpoint, setMediumBreakpoint] = useState(true);
  noFilter = !!noFilter;

  // row selection
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    []
  );

  // @ts-ignore - temp turned off
  const [bulkSelect, setBulkSelect] = useState(false);
  let checked = false;
  let indeterminate = false;

  const noFieldsSelected = fieldMeta?.order?.active?.length === 0;
  const wrapperId = "tol-table-wrapper-" + id;

  if (selectedRows.length === data.length || bulkSelect) {
    checked = true;
  } else if (selectedRows.length === 0) {
    checked = false;
  } else if (selectedRows.length > 0 && selectedRows.length < data.length) {
    indeterminate = true;
  }

  // @ts-ignore
  const handleCheckAll = (value: any, checked: boolean) => {
    const keys = checked ? data.map((item) => item.key) : [];
    setSelectedRows && setSelectedRows(keys);
  };

  const handleCheck = (value: any, checked: boolean) => {
    const keys = checked
      ? [...selectedRows, value]
      : selectedRows.filter((item) => item !== value);
    setSelectedRows(keys);
  };

  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) {
      setSmallBreakpoint(width < 800);
      setMediumBreakpoint(width < 1000);
    }
  });

  useEffectUpdate(() => {
    checked = false;
    setSelectedRows([]);
  }, [page, pageSize, filter, sortByAttribute, sortByType]);

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
      tooltip: "Configure Table",
      onClick: () => {
        setOpen(true);
      },
      icon: "sliders",
      outline: true,
      disabled: loading
    }
    : {
      visible: false,
    };

  const filterButton: PButton =
    (!noFilter &&
      fieldMeta.order.active.length !== 0 &&
      privilege === PRIVILEGE.BOARD.EDITABLE) ||
      privilege === undefined
      ? {
        visible: true,
        position: "right",
        type: "primary",
        onClick: () => {
          setFilterVisibility(!filterVisibility);
        },
        icon: filterVisibility ? "eye-slash" : "eye",
        tooltip: filterVisibility ? "Hide Filters" : "Show Filters",
        outline: true,
      }
      : {
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
        title={utilityBarConfig.title}
        elements={
          !noPagination && fieldMeta?.order?.active?.length > 0
            ? [
              <span className="tol-page-size">
                {!smallBreakpoint &&
                  (privilege === PRIVILEGE.BOARD.EDITABLE || !privilege) && (
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
          configButton,
          filterButton,
          ...(utilityBarConfig.buttons || []),
          actionDropdown,
          downloadButton,
        ]}
        {...utilityBarConfig}
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
                  {privilege === PRIVILEGE.BOARD.EDITABLE || !privilege ? (
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
                  data={data}
                  headerHeight={!noFilter && filterVisibility ? 85 : 42}
                  loading={loading}
                  sortColumn={sortByAttribute}
                  sortType={sortByType}
                  onSortColumn={handleSortColumn!}
                  expandedRowKeys={expandedRows}
                  renderRowExpanded={RowExpander}
                  shouldUpdateScroll={false}
                  rowKey={"key"}
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
                  fillHeight
                  wordWrap
                  renderLoading={() => (
                    <Placeholder loader opacity={0.8} squareCorners />
                  )}
                >
                  {rowSelection && (
                    <Column key="rowSelection" width={58}>
                      <HeaderCell>
                        <Checkbox
                          className="tol-table-row-selection"
                          checked={checked}
                          indeterminate={indeterminate}
                          disabled={bulkSelect || data.length === 0}
                          onChange={handleCheckAll}
                          style={data.length === 0 ? { display: "none" } : {}}
                        />
                      </HeaderCell>
                      <Cell>
                        {(rowData: any) => {
                          return (
                            <Checkbox
                              className="tol-table-row-selection"
                              value={rowData.key}
                              checked={
                                bulkSelect ||
                                selectedRows.some((item) => item === rowData.key)
                              }
                              disabled={bulkSelect}
                              onChange={handleCheck}
                            />
                          );
                        }}
                      </Cell>
                    </Column>
                  )}
                  {fieldMeta!.order.active.map((key: string) => {
                    const field = fieldMeta.dataWithDefaults![key];
                    if (field) {
                      const sortable: boolean =
                        (!noSorting && field.sort) ?? false;
                      const filterable = !noFilter && field.filter;

                      return (
                        <Column
                          key={key}
                          width={field.width || 200}
                          sortable={sortable}
                          fixed={field.fixed}
                        >
                          <HeaderCell>
                            <AttributeTitle
                              {...props}
                              attributeId={key}
                              className="tol-header-text"
                              rename={field.rename!}
                            />
                            {filterable && (
                              <span
                                className={
                                  filterVisibility
                                    ? "tol-filter"
                                    : "tol-filter-hide"
                                }
                              >
                                <Filter
                                  {...props}
                                  attribute={key}
                                  rename={field.rename!}
                                  type={field.filter as IFilterInputType}
                                  componentId={id}
                                />
                              </span>
                            )}
                            <Sort
                              {...props}
                              attribute={key}
                              sortable={sortable}
                            />
                            <FieldDropdown
                              {...props}
                              attribute={key}
                              data={data}
                              separator={copySeparator}
                            />
                          </HeaderCell>
                          <Cell dataKey={key} />
                        </Column>
                      );
                    }
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
