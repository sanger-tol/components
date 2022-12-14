/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { httpClient } from '.././services/http/httpClient'
import { Alert } from 'react-bootstrap';
import Table from "./Table";
import { convertTableData, convertHeadingData } from "./Utils"


export interface Props {
  endpoint: string
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
      headings: [{}],
      page: 1,
      sizePerPage: 20,
      totalSize: 0,
      error: false
    }
  }

  refreshTable = () => {
    const { page, sizePerPage } = this.state;
    this.handleTableChange('pagination', { page:page, sizePerPage:sizePerPage })
  }

  componentDidMount() {
    this.refreshTable()
  }

  handleTableChange = (type: string, { page, sizePerPage } : {
    page: number, sizePerPage: number
  }) => {
    if (type === "pagination") {
      httpClient().get("/" + this.props.endpoint + "?page=" + page + "&page_size=" + sizePerPage)
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
              headings: convertHeadingData(headings)
            })
          } catch (error) {
            console.error(error)
          }
        })
        .catch((error: any) => {
          console.log(error)
          this.setState({
            error: true
          })
        }
      )
      this.setState(() => ({ tableData: [] }));
    }
  }

  render() {
    const { tableData, headings, page, sizePerPage, totalSize } = this.state;

    return (
      <div>
        {(() => {
          if (this.state.error) {
            return (
              <Alert key="danger" variant="danger">
                Error: Cannot connect to database
              </Alert>
            )
          } else {
            return (
              <Table
                tableData={ tableData }
                columns={ headings }
                onTableChange={ this.handleTableChange }
                page={ page }
                sizePerPage={ sizePerPage }
                totalSize={ totalSize }
              />
            )
          }
        })()}
      </div>
    );
  }
}

export default AutoTable;
