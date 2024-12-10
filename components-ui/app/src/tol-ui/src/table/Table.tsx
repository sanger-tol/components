/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button, Row, Col, Placeholder, Loader, useEffectUpdate } from '../index';
import { Table as RSTable, Pagination, SelectPicker, Checkbox } from "rsuite";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSliders, faDownload, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import ConfigModal from './ConfigModal';
import { exportTableToSpreadsheet } from "./Utils";
import Filter, { FilterType } from '../filtering/Filter';
import { InfoTooltip, PopUpMessage } from '../general';
import { FieldMeta } from './Field';
import HoverOverlay from '../general/HoverOverlay';
import { Zone } from '../board';


export type NumRows = 25 | 50 | 100 | 1000;

interface Props {
  id: string,
  data: any,
  fieldMeta: FieldMeta,
  height: any,
  loading: boolean,

  endpoint: string,
  baseUrl?: string,

  page: number,
  setPage: any,
  pageSize: NumRows | number,
  setPageSize: any,
  totalSize: number,
  rowCounter?: JSX.Element,
  displaySource?: boolean,

  filterVisibility?: boolean,
  setFilterVisibility?: any,

  sortColumn: string,
  sortType: any,
  defaultSort?: string,
  handleSortColumn: any,

  zone: Zone,
  setZone: any,
  filter: any,

  onModalSave: any

  noFilter?: boolean,
  noPagination?: boolean,
  noSorting?: boolean,
  noConfigModal?: boolean,
  noDownload?: boolean,
  rowSelection?: boolean
}

function Table (props: Props) {
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
    rowSelection
    /* eslint-enable */
  } = props;

  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  noFilter = !!noFilter;

  // row selection
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkSelect, setBulkSelect] = useState(false);
  let checked = false;
  let indeterminate = false;

  if (selectedRows.length === data.length || bulkSelect) {
    checked = true;
  } else if (selectedRows.length === 0) {
    checked = false;
  } else if (selectedRows.length > 0 && selectedRows.length < data.length) {
    indeterminate = true;
  }

  // @ts-ignore
  const handleCheckAll = (value: any, checked: boolean) => {
    const keys = checked ? data.map(item => item.id) : [];
    setSelectedRows(keys);
  };

  const handleCheck = (value: any, checked: boolean) => {
    const keys = checked ? [...selectedRows, value] : selectedRows.filter(item => item !== value);
    setSelectedRows(keys);
  };

  useEffectUpdate(() => {
    checked = false;
    setSelectedRows([]);
  }, [page, pageSize, filter, sortColumn, sortType]);

  const downloadBtn = (
    <Button 
      className="config-button-right"
      variant="primary"
      onClick={() => exportTableToSpreadsheet(
        endpoint,
        fieldMeta.data,
        filter!,
        sortColumn,
        sortType,
        setSuccess,
        setError,
        setDownloading,
        defaultSort,
        baseUrl
      )}
      disabled={totalSize < 1 || totalSize >= 10000}
    >
      {downloading ? (
        <Loader
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      ) : (
        <FontAwesomeIcon icon={faDownload} size="sm" />
      )}
    </Button>
  );

  return (
    <div style={{height: height}} className='tol-table'>
      <PopUpMessage
        type='success'
        message={success}
        setMessage={setSuccess}
      />
      <PopUpMessage
        type='danger'
        message={error}
        setMessage={setError}
      />
      <Row>
        <Col md={12} lg={9}>
          {rowSelection &&
            <>
              <Button 
                className="config-button-left"
                variant="primary"
                active={bulkSelect}
                onClick={() => {
                  handleCheckAll(null, !bulkSelect);
                  setBulkSelect(!bulkSelect);
                }}
              >
                <FontAwesomeIcon icon={faCheckDouble} size="sm" />
              </Button>
            </>
          }
          {(!noPagination && fieldMeta.order.active.length > 0) &&
            <>
              {rowCounter ? rowCounter : totalSize}
              <span className='tol-page-size'>
                <SelectPicker
                  value={pageSize}
                  onChange={setPageSize}
                  size="sm"
                  cleanable={false}
                  searchable={false}
                  data={[
                    { label: "25", value: 25 },
                    { label: "50", value: 50 },
                    { label: "100", value: 100 }
                  ]}
                />
              </span>
              <span className='tol-skip'>
                <Pagination
                  className="tol-pagination"
                  size="sm"
                  layout={['skip']}
                  total={totalSize}
                  activePage={page}
                  onChangePage={setPage}
                  limit={pageSize}
                  onChangeLimit={setPageSize}
                />
              </span>
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
                layout={['pager']}
                total={totalSize}
                activePage={page}
                onChangePage={setPage}
                limit={pageSize}
                onChangeLimit={setPageSize}
              />
            </>
          }
        </Col>
        <Col md={12} lg={3}>
          {!noConfigModal &&
            <Button 
              className="config-button-right"
              variant="primary"
              onClick={() => {
                setOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faSliders} size="sm" />
            </Button>
          }
          {open &&
            <ConfigModal
              tableId={id}
              fieldMeta={fieldMeta}
              open={open}
              pageSize={pageSize}
              setOpen={setOpen}
              onModalSave={onModalSave}
              displaySource={displaySource}
            />
          }
          {!noFilter &&
            <Button
              className="config-button-right"
              active={filterVisibility}
              variant="primary"
              onClick={ () => setFilterVisibility(!filterVisibility) }
              disabled={fieldMeta.order.active.length === 0}
            >
              <FontAwesomeIcon icon={faFilter} size="sm" />
            </Button>
          }
          {!noDownload &&
            <>
              {totalSize >= 10000 ? 
                <div className="config-position-wrapper">
                  <HoverOverlay
                    contents="Only 10,000 results can currently be downloaded."
                    followCursor
                  >
                    <div className="tooltip-wrapper">
                      {downloadBtn}
                    </div>
                  </HoverOverlay>
                </div>
                :
                <>{downloadBtn}</>
              }
            </>
          }
        </Col>
      </Row>
      {fieldMeta.order.active.length === 0 ?
        <Placeholder
          table
          message={
            <>
            Please add a field to get started. Click
            <FontAwesomeIcon
              icon={faSliders}
              size="lg"
              style={{padding: "0 10"}}
            />
            to configure.
            </>
          }
          height={height}
        />
      :
        <div className='tol-table-inner'>
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
                  return 'tol-selected-row disabled';
                } else if (selectedRows.some(item => item === rowData.id)) {
                  return 'tol-selected-row';
                }
              }
              return '';
            }}
            fillHeight
            wordWrap
            renderLoading={
              () => (
                <Placeholder
                  loader
                  height={height}
                  opacity={0.8}
                  squareCorners
                />
              )
            }
          >
            {rowSelection &&
              <Column key="rowSelection" width={60}>
                <HeaderCell>
                  <Checkbox
                    className="tol-row-selection"
                    checked={checked}
                    indeterminate={indeterminate}
                    disabled={bulkSelect || data.length === 0}
                    onChange={handleCheckAll}
                    style={
                      data.length === 0
                      ? {display: 'none'}
                      : {}
                    }
                  />
                </HeaderCell>
                <Cell dataKey="id">
                  {(rowData: {id: any}) => {
                    return (
                      <Checkbox
                        className="tol-row-selection"
                        value={rowData.id}
                        checked={bulkSelect || selectedRows.some(item => item === rowData.id)}
                        disabled={bulkSelect}
                        onChange={handleCheck}
                      />
                    );
                  }}
                </Cell>
              </Column>
            }
            {fieldMeta!.order.active.map((key: string) => {
              const field = fieldMeta.data[key];
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
                    {field.description &&
                      <div className='tol-header-info'>
                        <InfoTooltip contents={field.description} />
                      </div>
                    }
                    <p className='tol-header-text'>
                      {field.rename}
                    </p>
                    {filterable &&
                      <span className={filterVisibility ? "tol-filter" : "tol-filter-hide"}>
                        <Filter
                          attribute={key}
                          rename={field.rename!}
                          type={field.filter as FilterType}
                          componentId={id}
                          {...props}
                        />
                      </span>
                    }
                  </HeaderCell>
                  <Cell dataKey={key} />
                </Column>
              );
            })}
          </RSTable>
        </div>
      }
    </div>
  );
}

export default Table;
