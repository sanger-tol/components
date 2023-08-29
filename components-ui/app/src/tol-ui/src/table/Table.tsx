/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from '../index'
import TableLoadingHelix from './TableLoadingHelix';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import { switchFilterVisibility, setTableHeight } from './TableUtils';
import paginationFactory, { PaginationProvider,
                            PaginationListStandalone,
                            SizePerPageDropdownStandalone,
                            PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


function addPlus(totalSize: number) {
  // add a plus for elastic search (results cap at 10,000)
  if (totalSize === 10000) {
    return "+"
  }
  return ""
}

function Table ({
  id,
  data,
  columns,
  onTableChange,
  page,
  sizePerPage,
  totalSize,
  includeNav,
  loading,
  tableStatusIndicator,
  height
}) {
  const options = {
    custom: true,
    page,
    sizePerPage, 
    totalSize,
    sizePerPageList: [
      { text: '25', value: 25 },
      { text: '50', value: 50 },
      { text: '100', value: 100 }
    ]
  }

  // keep previously set table height
  setTableHeight(id, height)

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
          {includeNav &&
            <div>
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
            columns={ columns }
            onTableChange={ onTableChange }
            pagination={ paginationFactory(options) }
            filter={ filterFactory() }
            noDataIndication={ tableStatusIndicator }
            rowClasses='tol-row'
          />
          {includeNav &&
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
