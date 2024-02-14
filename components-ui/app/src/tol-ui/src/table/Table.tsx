/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button, Row, Col, Placeholder, Loader } from '../index';
import { Table as RSTable, Pagination, SelectPicker } from "rsuite";
import {
  addTotalText, 
  setFieldMetaAttributeInStorage
} from './TableUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSliders, faDownload } from '@fortawesome/free-solid-svg-icons';
import ConfigModal from './ConfigModal';
import { exportTableToSpreadsheet } from "./TableUtils";
import Filter, { FilterType } from '../general/Filter';
import { PopUpMessage } from '../general';
import { FieldMeta } from './Field';
import HoverOverlay from '../general/HoverOverlay';


interface Props {
  id: string,
  data: any,
  fieldMeta: FieldMeta,
  height: number,
  loading: boolean,

  endpoint: string,
  baseUrl?: string,

  page: number,
  setPage: any,
  pageSize: number,
  setPageSize: any,
  totalSize: number,

  sortColumn: string,
  sortType: any,
  defaultSort?: string,
  handleSortColumn: any,

  filter?: object,
  setFilter?: any,

  modalOnSave: any,

  noFilter?: boolean,
  noPagination?: boolean,
  noSorting?: boolean,
  noConfigModal?: boolean,
  noDownload?: boolean
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

    sortColumn,
    sortType,
    defaultSort,
    handleSortColumn,
  
    filter,
    setFilter,

    modalOnSave,

    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload
    /* eslint-enable */
  } = props;

  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(fieldMeta.filterVisibility);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // show certain components as default
  const showAsDefault = (noComponent?: boolean) => {
    if (noComponent === undefined) return false;
    return true;
  };

  noFilter = showAsDefault(noFilter);
  noPagination = showAsDefault(noPagination);
  noSorting = showAsDefault(noSorting);
  noConfigModal = showAsDefault(noConfigModal);
  noDownload = showAsDefault(noDownload);

  const toggleFilterVisibility = (visibility: boolean) => {
    setFilterVisible(visibility);
    setFieldMetaAttributeInStorage(id, visibility, "filterVisibility");
  };

  /*
  const resizeColumnWidth = (columnWidth?: number, dataKey?: string) => {
    const storedFieldMeta = getFieldMetaAttributeFromStorage(id)
    storedFieldMeta.data[dataKey!].width = columnWidth
    setFieldMetaAttributeInStorage(id, storedFieldMeta)
  }
  */

  const downloadBtn = (
    <Button 
      className="config-button"
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
          {!noPagination &&
            <>
              <span className='tol-total'>
                {addTotalText(totalSize)}
              </span>
              <span className='tol-page-size'>
                <SelectPicker
                  value={pageSize}
                  onChange={setPageSize}
                  size="sm"
                  cleanable={false}
                  searchable={false}
                  data={[{ label: "25", value: 25 },
                    { label: "50", value: 50 },
                    { label: "100", value: 100 }]}
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
              className="config-button"
              variant="primary"
              onClick={ () => {
                setOpen(true);
              } }
            >
              <FontAwesomeIcon icon={faSliders} size="sm" />
            </Button>
          }
          {open &&
            <ConfigModal
              tableId={id}
              fieldMeta={fieldMeta}
              open={open}
              setOpen={setOpen}
              modalOnSave={modalOnSave}
            />
          }
          {!noFilter &&
            <Button
              className="config-button"
              variant="primary"
              onClick={ () => toggleFilterVisibility(!filterVisible) }
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
      <div className='tol-table-inner'>
        <RSTable
          bordered
          data={data}
          headerHeight={filterVisible ? 85 : 45}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn!}
          fillHeight
          wordWrap
          renderLoading={
            () => (
              <Placeholder
                loader
                height={height - 80}
                opacity={0.8}
                squareCorners
              />
            )
          }
        >
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
                // resizable
                // onResize={resizeColumnWidth}
              >
                <HeaderCell>
                  <p className='tol-header-text'>
                    {field.rename}
                  </p>
                  {filterable &&
                    <span className={filterVisible ? "tol-filter" : "tol-filter-hide"}>
                      <Filter
                        {...props}
                        id={key}
                        rename={field.rename!}
                        type={field.type as FilterType}
                        filter={filter!}
                        setFilter={setFilter!}
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
    </div>
  );
}

export default Table;
