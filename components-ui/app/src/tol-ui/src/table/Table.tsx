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
  EntityMetaToolTip,
  UtilityBar,
  resizeListener,
  ColumnConfigDrawer,
  getSourceColour,
  Filter,
  IFilterInputType,
  FieldMeta,
  IDropdownButtonConfig,
  useStateFallback,
  IUtilityBar,
  IButton,
  IDropdownButtons,
  IRemoteTargetAndZone,
  useBoardPrivilege,
  PRIVILEGE,
} from "..";

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
  setTotalSize?: (totalSize: number) => void;
  rowCounter?: JSX.Element;
  displaySource?: boolean;

  filterVisibility?: boolean;
  setFilterVisibility?: any;

  sortColumn: string;
  sortType: any;
  defaultSort?: string;
  handleSortColumn: any;

  filter: any;

  onModalSave: any;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  rowSelection?: boolean;
  actions?: IDropdownButtonConfig[];
  actionChoices?: string[];
  actionsFooter?: IDropdownButtonConfig;
  utilityBarConfig?: IUtilityBar;
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;

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

    objectType,
    dataSource,
    source,

    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
    rowCounter,
    displaySource,

    filterVisibility,
    setFilterVisibility,

    sortColumn,
    sortType,
    defaultSort,
    handleSortColumn,

    onModalSave,
    filter,

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
    groupBy,
    downloadInProgress,
    /* eslint-enable */
  } = props;

  const { privilege } = useBoardPrivilege()

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

  const { privilege } = useBoardPrivilege();

  if (selectedRows.length === data.length || bulkSelect) {
    checked = true;
  } else if (selectedRows.length === 0) {
    checked = false;
  } else if (selectedRows.length > 0 && selectedRows.length < data.length) {
    indeterminate = true;
  }

  // @ts-ignore
  const handleCheckAll = (value: any, checked: boolean) => {
    const keys = checked ? data.map((item) => item.id) : [];
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
  }, [page, pageSize, filter, sortColumn, sortType]);

  const actionDropDownButtons = actions?.map((button) => ({
    ...button,
    action: () => {
      button.action(selectedRows, filter);
    },
    disabled: selectedRows.length === 0,
  }));

  const configButton: IButton = !noConfigModal
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
    }
    : {
      visible: false,
    };

  const filterButton: IButton =
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

  const downloadButton: IButton = !noDownload ? {
    visible: true,
    position: "right",
    type: "primary",
    tooltip: "Download the tables current state in various formats",
    onClick: () => {
      setDownloadOpen(!downloadOpen);
    },
    disabled: totalSize <= 0 || noFieldsSelected,
    icon: "download",
    disabledTooltip:
      totalSize >= 1
        ? "Must have at least one row to download."
        : undefined,
    outline: true,
    loading: downloadInProgress
  } : {
    visible: false,
  };

  const actionDropdown: IDropdownButtons | undefined =
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
        fields={fieldMeta?.order?.active}
        title={utilityBarConfig.title}
      />
      <ColumnConfigDrawer
        {...props}
        title={"Table Configuration"}
        fieldMeta={fieldMeta}
        actions={actions}
        defaultSort={defaultSort}
        open={open}
        groupBy={groupBy}
        setOpen={setOpen}
        displaySource={displaySource}
        customAttributeSelection={[
          ...(fieldMeta.order.active ?? []),
          ...(fieldMeta.order.inactive ?? [])
        ]}
        onConfigSave={onModalSave}
      />
      {/*rowSelection && (
          <>
            <Button
              position="left"
              type="primary"
              active={bulkSelect}
              onClick={() => {
                handleCheckAll(null, !bulkSelect);
                setBulkSelect(!bulkSelect);
              }}
              icon="check-double"
              outline
            />
          </>
        )*/}
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
              <div className="tol-table-row-counter">
                {rowCounter ? rowCounter : totalSize}
              </div>
              <div className="tol-table-inner">
                <RSTable
                  bordered
                  data={data}
                  headerHeight={!noFilter && filterVisibility ? 85 : 42}
                  loading={loading}
                  sortColumn={sortColumn}
                  sortType={sortType}
                  onSortColumn={handleSortColumn!}
                  rowClassName={(rowData: any) => {
                    if (rowData) {
                      if (bulkSelect) {
                        return "tol-selected-row disabled";
                      } else if (
                        selectedRows.some((item) => item === rowData.id)
                      ) {
                        return "tol-selected-row";
                      }
                    }
                    return "";
                  }}
                  fillHeight
                  wordWrap
                  renderLoading={() => (
                    <Placeholder
                      loader
                      height={height}
                      opacity={0.8}
                      squareCorners
                    />
                  )}
                >
                  {rowSelection && (
                    <Column key="rowSelection" width={60}>
                      <HeaderCell>
                        <Checkbox
                          className="tol-row-selection"
                          checked={checked}
                          indeterminate={indeterminate}
                          disabled={bulkSelect || data.length === 0}
                          onChange={handleCheckAll}
                          style={data.length === 0 ? { display: "none" } : {}}
                        />
                      </HeaderCell>
                      <Cell dataKey="id">
                        {(rowData: { id: any }) => {
                          return (
                            <Checkbox
                              className="tol-row-selection"
                              value={rowData.id}
                              checked={
                                bulkSelect ||
                                selectedRows.some((item) => item === rowData.id)
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
                    const field = fieldMeta.data![key];
                    const sortable = noSorting ? false : field.sort;
                    const filterable = noFilter ? false : field.filter;

                    return (
                      <Column
                        key={key}
                        width={field.width}
                        sortable={sortable}
                        fixed={field.fixed}
                      >
                        <HeaderCell>
                          {(field.description || field.source) && (
                            <div className="tol-header-info">
                              <EntityMetaToolTip
                                objectType={objectType}
                                dataSource={dataSource}
                                field={key}
                              />
                            </div>
                          )}
                          <p className="tol-header-text">
                            {field.source && (
                              <span
                                className="inline-source"
                                style={{
                                  backgroundColor: getSourceColour(
                                    field.source
                                  ),
                                }}
                              />
                            )}
                            {field.rename}
                          </p>
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
                        </HeaderCell>
                        <Cell dataKey={key} />
                      </Column>
                    );
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
