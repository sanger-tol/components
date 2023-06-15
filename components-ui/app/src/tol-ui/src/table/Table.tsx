/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from '../index'
import { SearchIcon } from '../general/Icons';
import TableLoadingHelix from './TableLoadingHelix';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import { switchFilterVisibility } from './TableUtils';
import paginationFactory, { PaginationProvider,
                            PaginationListStandalone,
                            SizePerPageDropdownStandalone,
                            PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


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
  tableStatusIndicator
}) {
  const options = {
    custom: true,
    page,
    sizePerPage, 
    totalSize 
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
          {includeNav &&
            <div>
              <Button
                className="tol-table-filter-button"
                variant="primary"
                onClick={ () => switchFilterVisibility(id) }
              >
                <SearchIcon />
                Filter
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
            <PaginationTotalStandalone
              { ...paginationProps }
            />
          }
        </div>
      )
    }
    </PaginationProvider>
  );
}

export default Table;
