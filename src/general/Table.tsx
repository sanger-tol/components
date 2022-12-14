/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import LoadingHelix from "./LoadingHelix";

const Table = ({ tableData, columns, onTableChange, page, sizePerPage, totalSize }) => (
  <BootstrapTable 
    remote
    keyField='id'
    data={ tableData }
    columns={ columns }
    onTableChange={ onTableChange }
    pagination={ paginationFactory({ page, sizePerPage, totalSize }) }
    noDataIndication={ () => <LoadingHelix /> }
  />
);

export default Table;
