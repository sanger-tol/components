/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { httpClient } from '../services/http/httpClient'
import Table from "./Table";
import LoadingHelix from "./LoadingHelix";
import NoDataAlert from "./NoDataAlert";
import NoDbAlert from "./NoDbAlert";
import { convertTableData,
         convertHeadingData,
         switchFilterVisability } from "./TableUtils"


export interface Props {
  endpoint: string,
  requiredAttributes?: object
}

export interface State {
  tableData: any[],
  headings: any[],
  page: number,
  sizePerPage: number,
  totalSize: number,
  error: boolean
}

class AutoTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tableData: [],
      headings: [{
        dataField: "",
        text: ""
      }],
      page: 1,
      sizePerPage: 50,
      totalSize: -1,
      error: false
    }
  }

  refreshPagination = () => {
    const { page, sizePerPage } = this.state;
    this.handleTableChange('pagination', { page: page, sizePerPage: sizePerPage })
  }

  componentDidMount() {
    this.refreshPagination()
  }

  handleTableChange = (type: string, { page, sizePerPage, filters, sortOrder, sortField } : {
    page: number,
    sizePerPage: number,
    filters?: object,
    sortOrder?: string,
    sortField?: string
  }) => {
    let searchFilters: string = "";

    // filtering
    if (type === "filter") {
      searchFilters = "["
      for (const dataField in filters) {
        const filterVal: string = filters[dataField]['filterVal'];
        searchFilters += dataField + "=='" + filterVal + "',"
      }
      searchFilters = searchFilters.slice(0, -1)
      if (searchFilters.length !== 0) {
        searchFilters += "]"
      }
    }

    // sorting
    if (sortOrder === 'desc') {
      sortField = '-' + sortField
    }

    // get data and update state
    httpClient().get("/" + this.props.endpoint, { 
      params: {
        page: page,
        page_size: sizePerPage,
        filter: searchFilters,
        sort_by: sortField
      }
      })
      .then((res: any) => {
        let data = res.data.data
        let meta = res.data.meta
        this.setState({
          tableData: convertTableData(data),
          page: page,
          sizePerPage: sizePerPage,
          totalSize: meta.total
        })
        try {
          const headings = Object.keys(data[0].attributes)
          this.setState({
            headings: convertHeadingData(headings, this.props.requiredAttributes)
          })
        } catch (error) {}
      })
      .catch((error: any) => {
        console.error(error)
        this.setState({
          error: true
        })
      }
    )
    this.setState(() => ({
      tableData: [],
      totalSize: this.state.totalSize
    }));
  }

  render() {
    const { tableData, headings, page, sizePerPage, totalSize, error } = this.state;

    return (
      <div>
        {(() => {
          let noDataIndication: JSX.Element;
          if (error) {
            noDataIndication = <NoDbAlert />
          } else if (totalSize === 0) {
            noDataIndication = <NoDataAlert />
          } else {
            noDataIndication = <LoadingHelix />
          }
          return (
            <Table
              data={ tableData }
              columns={ headings }
              onTableChange={ this.handleTableChange }
              onFilterButton={ switchFilterVisability }
              page={ page }
              sizePerPage={ sizePerPage }
              totalSize={ totalSize }
              noDataIndication={ noDataIndication }
            />
          )
        })()}
      </div>
    );
  }
}

export default AutoTable;
