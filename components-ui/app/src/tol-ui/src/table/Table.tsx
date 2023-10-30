/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button } from '../index';
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
import { faFilter, faSliders } from '@fortawesome/free-solid-svg-icons';
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
  loading: boolean,
  tableStatusIndicator: any,
  modalOnSave: Function,
  height?: number
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
    loading,
    tableStatusIndicator,
    modalOnSave
  } = props;
  const [open, setOpen] = useState(false)

  // show certain components as default
  const showAsDefault = (noComponent?: boolean) => {
    if (noComponent === undefined) return true
    return false
  }
  noPagination = showAsDefault(noPagination)
  noFilter = showAsDefault(noFilter)
  noConfigModal = showAsDefault(noConfigModal)

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
