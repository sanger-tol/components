/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from '../index'
import TableModal from './TableModal'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory, { PaginationProvider,
                            PaginationListStandalone,
                            SizePerPageDropdownStandalone,
                            PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSliders } from '@fortawesome/free-solid-svg-icons';
import { pruneHiddenColumns } from "./TableUtils"


function Table ({ 
  data,
  columns,
  onTableChange,
  onFilterButton,
  page,
  sizePerPage,
  totalSize,
  includeNav,
  noDataIndication
}) {
  const options = {
    custom: true,
    page,
    sizePerPage, 
    totalSize 
  }
  const [open, setOpen] = useState(false);
  
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
                onClick={ () => {
                  setOpen(true)
                }}
              >
                <FontAwesomeIcon icon={faSliders} size="sm" />
              </Button>
              {open ? 
                <TableModal
                  columns={columns}
                  open={open}
                  setOpen={setOpen}
                />
              :
              <></>
              }
              <Button className="tol-table-button" variant="primary" onClick={ onFilterButton }>
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
          <BootstrapTable
            { ...paginationTableProps }
            remote
            keyField='id'
            data={ data }
            columns={ pruneHiddenColumns(columns) }
            onTableChange={ onTableChange }
            pagination={ paginationFactory(options) }
            filter={ filterFactory() }
            noDataIndication={ () => noDataIndication }
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
