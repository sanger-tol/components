/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Button,
  Placeholder,
  useEffectUpdate,
  DropdownButtons,
  PopUpMessage,
  DownloadModal,
  EntityMetaToolTip,
  UtilityBar
} from "../index";
import { Table as RSTable, Pagination, SelectPicker, Checkbox } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import ColumnConfigDrawer from "./ColumnConfigDrawer";
import { exportTableToSpreadsheet, getAllowedFields, getSourceColour } from "./utils";
import Filter, { IFilter } from "../filtering/Filter";
import { FieldMeta } from "./Field";
import { IZone } from "../boards";
import { DropdownButtonProps } from "../general/DropdownButtons";
import { useStateFallback } from "../hooks/useStateFallback";
import { IButton, IInlineEdit } from "../models";


export type NumRows = 25 | 50 | 100 | 250 | 1000;

interface Props {
  id: string;
  data: any;
  fieldMeta: FieldMeta;
  height: any;
  loading: boolean;

  endpoint: string;
  baseUrl?: string;
  source?: string;

  page: number;
  setPage: any;
  pageSize: number | NumRows;
  setPageSize: any;
  totalSize: number;
  rowCounter?: JSX.Element;
  displaySource?: boolean;

  filterVisibility?: boolean;
  setFilterVisibility?: any;

  sortColumn: string;
  sortType: any;
  defaultSort?: string;
  handleSortColumn: any;

  zone: IZone;
  setZone: any;
  filter: any;

  onModalSave: any;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  rowSelection?: boolean;
  actions?: DropdownButtonProps[];
  actionsFooter?: DropdownButtonProps;
  configButtons?: JSX.Element[];
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;
}

function Table(props: Props) {
  const { Column, HeaderCell, Cell } = RSTable;
  let {
    /* eslint-disable */
    id,
    data,
    fieldMeta,
    height,
    loading,

    endpoint,
    baseUrl,
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
    configButtons,
    /* eslint-enable */
  } = props;

  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("!");
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
  const noFieldsSelected = fieldMeta.order.active.length === 0;

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

  useEffect(() => {
    success &&
      PopUpMessage({
        message: success,
        type: "success",
      });
  }, [success]);

  useEffect(() => {
    error &&
      error !== "!" &&
      PopUpMessage({
        message: error,
        type: "error",
      });
  }, [error]);

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

   const configButton: IButton = !noConfigModal ? {
    visible: true,
    position: "right",
    type:"primary",
    onClick: () => {
      setOpen(true);
    },
    icon:"sliders",
    outline: true
   } : {
    visible: false
   }

   const filterButton: IButton = !noFilter ? {
    visible: true,
    position: "right",
    type: "primary",
    onClick: () => {setFilterVisibility(!filterVisibility)},
    icon: "eye-slash",
    outline: true
   } : {
    visible: false
   }

   const downloadButton: IButton = !noDownload ? {
    visible: true,
    position: "right",
    type: "primary",
    onClick:() => {
      setDownloadOpen(!downloadOpen)
    },
    disabled: totalSize <= 0 || noFieldsSelected,
    loading: downloading,
    icon: "download",
    disabledTooltip:
      totalSize >= 1
        ? "Must have at least one row to download."
        : undefined
    ,
    outline: true
   } : {
    visible: false
   }

  return (
    <div style={{ height: height }} className="tol-table">
      <DownloadModal
        size="sm"
        open={downloadOpen}
        setOpen={setDownloadOpen}
        objectType={endpoint}
        filter={filter}
        source={source}
        fields={fieldMeta.order.active}
        totalSize={totalSize}
        action={() =>
          exportTableToSpreadsheet(
            endpoint,
            fieldMeta.data,
            filter!,
            sortColumn,
            sortType,
            setSuccess,
            setError,
            setDownloading,
            defaultSort,
            baseUrl,
          )
        }
      />
      <ColumnConfigDrawer
        open={open}
        setOpen={setOpen}
        title={"Add/Remove Table Columns"}
        displaySource={displaySource}
        customAttributeSelection={getAllowedFields(fieldMeta)}
        onConfigSave={onModalSave}
        {...props}
      />
      <div className="tol-table-bar">
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
        <div style={{ float: "left" }}>
          {actions && actions.length > 0 && (
            <DropdownButtons
              mainButtonIcon={{
                icon: "paper-plane",
                type: "primary",
                position: "left",
                outline: selectedRows.length === 0,

              }}
              dropdownButtons={actionDropDownButtons}
              footer={actionsFooter}
              placement={"rightStart"}
            />
          )}
        </div>
        {!noPagination && fieldMeta.order.active.length > 0 && (
          <UtilityBar
            elements={[
            <>{rowCounter ? rowCounter : totalSize}</>,
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
                  { label: "100", value: 250 },
                ]}
              />
            </span>,
            <Pagination
              className="tol-pagination"
              size="sm"
              layout={["skip"]}
              total={totalSize}
              activePage={page}
              onChangePage={setPage}
              limit={pageSize}
              onChangeLimit={setPageSize}
            />,
            <Pagination
              className="tol-pagination"
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              maxButtons={3}
              size="sm"
              layout={["pager"]}
              total={totalSize}
              activePage={page}
              onChangePage={setPage}
              limit={pageSize}
              onChangeLimit={setPageSize}
            />
            ]}
            buttons={[
              configButton,
              filterButton,
              downloadButton
            ]}
          />
        )}
        {configButtons}
      </div>
      {noFieldsSelected ? (
        <Placeholder
          message={
            <>
              Please add a field to get started. Click
              <FontAwesomeIcon
                icon={faSliders}
                size="lg"
                style={{ padding: "0 10" }}
              />
              to configure.
            </>
          }
          height={height}
        />
      ) : (
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
                } else if (selectedRows.some((item) => item === rowData.id)) {
                  return "tol-selected-row";
                }
              }
              return "";
            }}
            fillHeight
            wordWrap
            renderLoading={() => (
              <Placeholder loader height={height} opacity={0.8} squareCorners />
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
              const field = fieldMeta.data[key];
              const sortable = noSorting ? false : field.sort;
              const filterable = noFilter ? false : field.filter;
              console.log(field.source, field.rename);

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
                        <EntityMetaToolTip baseUrl={baseUrl} field={key} endpoint={endpoint} />
                      </div>
                    )}
                    <p className="tol-header-text">
                      {field.source && (
                        <span
                          className="inline-source"
                          style={{
                            backgroundColor: getSourceColour(field.source),
                          }}
                        />
                      )}
                      {field.rename}
                    </p>
                    {filterable && (
                      <span
                        className={
                          filterVisibility ? "tol-filter" : "tol-filter-hide"
                        }
                      >
                        <Filter
                          attribute={key}
                          rename={field.rename!}
                          type={field.filter as IFilter}
                          componentId={id}
                          {...props}
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
      )}
    </div>
  );
}

export default Table;
