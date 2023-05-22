/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from '../index'
import { SearchIcon } from '../general/Icons';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory, { PaginationProvider,
                            PaginationListStandalone,
                            SizePerPageDropdownStandalone,
                            PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { useState } from 'react';
import { Modal } from '../index';


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
              <Button className="tol-table-filter-button" variant="primary" onClick={ () => {
                setOpen(true)
              }}>
                Toggle
              </Button>
              {open ? 
                <Modal
                open={open}
                size={'sm'}
                setOpen={setOpen}
                >
                  <h2>Toggle Columns</h2>
                  {console.log(columns)}
                  {}
                </Modal>
              :
              <></>
              }
              <Button className="tol-table-filter-button" variant="primary" onClick={ onFilterButton }>
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
          <BootstrapTable
            { ...paginationTableProps }
            remote
            keyField='id'
            data={ data }
            columns={ columns }
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
