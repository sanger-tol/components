/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button } from '../index';
import TableLoadingHelix from './TableLoadingHelix';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import { switchFilterVisibility, addPlus } from './TableUtils';
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
  noNav?: boolean,
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
    noNav,
    noConfigModal,
    loading,
    tableStatusIndicator,
    modalOnSave
  } = props;
  const [open, setOpen] = useState(false)

  // show nav and configModal as default
  if (noNav === undefined) {
    noNav = true
  } else {
    noNav = false
  }
  if (noConfigModal === undefined) {
    noConfigModal = true
  } else {
    noConfigModal = false
  }

  const options = {
    custom: true,
    page,
    sizePerPage, 
    totalSize,
    sizePerPageList: [
      { text: '50', value: 50 },
      { text: '100', value: 100 },
      { text: '200', value: 200 }
    ]
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
          {noNav &&
            <div>
              {false && // temp excluded
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
                  fieldMeta={fieldMeta}
                  open={open}
                  setOpen={setOpen}
                  modalOnSave={modalOnSave}
                />
              }
              <Button
                className="tol-table-button"
                variant="primary"
                onClick={ () => switchFilterVisibility(id) }
              >
                <FontAwesomeIcon icon={faFilter} size="sm" />
              </Button>
              <SizePerPageDropdownStandalone
                { ...paginationProps }
              />
              <PaginationListStandalone
                { ...paginationProps }
              />
            </div>
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
          {noNav &&
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
