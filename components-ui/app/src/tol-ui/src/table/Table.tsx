/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button, Spinner, httpClient } from '../index';
import TableLoadingHelix from './TableLoadingHelix';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import { switchFilterVisibility,
         addPlus,
         setFieldMetaAttributeInStorage } from './TableUtils';
import paginationFactory, { PaginationProvider,
                            PaginationListStandalone,
                            SizePerPageDropdownStandalone,
                            PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSliders, faDownload } from '@fortawesome/free-solid-svg-icons';
import ConfigModal from './ConfigModal';
import { pruneHiddenColumns } from "./TableUtils";

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


interface Props {
  id: string,
  data: any,
  columns: any,
  fieldMeta: any,
  onTableChange: any,
  page: number,
  sizePerPage: number,
  totalSize: number,
  noPagination?: boolean,
  noFilter?: boolean,
  noConfigModal?: boolean,
  noDownload?: boolean,
  loading: boolean,
  tableStatusIndicator: any,
  modalOnSave: Function,
  height?: number,
  attributesForDownload: any
}

function Table (props: Props) {
  let {
    id,
    data,
    columns,
    fieldMeta,
    onTableChange,
    page,
    sizePerPage,
    totalSize,
    noPagination,
    noFilter,
    noConfigModal,
    noDownload,
    loading,
    tableStatusIndicator,
    modalOnSave,
    attributesForDownload
  } = props;
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // show certain components as default
  const showAsDefault = (noComponent?: boolean) => {
    if (noComponent === undefined) return true
    return false
  }
  noPagination = showAsDefault(noPagination)
  noFilter = showAsDefault(noFilter)
  noConfigModal = showAsDefault(noConfigModal)
  noDownload = showAsDefault(noDownload)

  const options = {
    custom: true,
    page,
    sizePerPage, 
    totalSize,
    sizePerPageList: [
      { text: '25', value: 25 },
      { text: '50', value: 50 },
      { text: '100', value: 100 }
    ],
    onSizePerPageChange: (sizePerPage: number) => {
      setFieldMetaAttributeInStorage(id, sizePerPage, 'pageSize')
    }
  }

  // function for the download onClick
  function exportTable(filters : any ) {
    setDownloading(true)

    const updatedColumnParams = columns.map(obj => ({
      text: obj.text,
      dataField: obj.dataField,
      hidden: obj.hidden
    }))

    httpClient().post('/' + filters.endpoint + ':export', { data: updatedColumnParams }, {
      params: {
        page: 1,
        page_size: 5000,
        filter: filters.apiFilters,
        sort_by: filters.sortField,
      },
      baseURL: filters.baseUrl,
      responseType: 'blob'
    })
    .then((res: any) => {
      // temporary URL for the blob
      const tempUrl = window.URL.createObjectURL(res.data)

      // Trigger the download with an anchor element
      const a = document.createElement('a')
      a.href = tempUrl
      a.download = 'download_table.xlsx'
      a.click()

      // Release the URL
      window.URL.revokeObjectURL(tempUrl)
      setDownloading(false)

      if (res.status !== 200) throw Error()
      setDownloading(false)
    }
  )}

  return (
    <PaginationProvider
      pagination={ paginationFactory(options) }
    >
    {
      ({
        paginationProps,
        paginationTableProps
      }) => (
        <div className='tol-table'>
          {noDownload && 
            <Button 
              className="tol-table-button"
              variant="primary"
              onClick={ () => exportTable(attributesForDownload) }
              disabled={ totalSize > 5000 }
            >
              { downloading ? (
                <Spinner
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
          }
          {noConfigModal &&
            <Button 
              className="tol-table-button"
              variant="primary"
              onClick={ () => {setOpen(true)} }
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
          {noFilter &&
            <Button
              className="tol-table-button"
              variant="primary"
              onClick={ () => switchFilterVisibility(id) }
            >
              <FontAwesomeIcon icon={faFilter} size="sm" />
            </Button>
          }
          {noPagination &&
            <>
              <SizePerPageDropdownStandalone
                { ...paginationProps }
              />
              <PaginationListStandalone
                { ...paginationProps }
              />
            </>
          }
          {loading &&
            <TableLoadingHelix />
          }
          <BootstrapTable
            { ...paginationTableProps }
            id={ id }
            remote
            keyField='id'
            data={ data }
            // @ts-ignore
            columns={ pruneHiddenColumns(columns) }
            onTableChange={ onTableChange }
            pagination={ paginationFactory(options) }
            filter={ filterFactory() }
            // @ts-ignore
            noDataIndication={ tableStatusIndicator }
            rowClasses='tol-row'
          />
          {noPagination &&
            <>
              <PaginationTotalStandalone
                { ...paginationProps }
              />
              { addPlus(totalSize) }
            </>            
          }
        </div>
      )
    }
    </PaginationProvider>
  );
}

export default Table;
