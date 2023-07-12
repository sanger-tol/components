/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { httpClient } from '../services/http/httpClient'
import Table from "./Table";
import { Fields } from "./Field";
import { tableStatusIndicator } from './TableUtils';
import TableEmpty from "./TableEmpty";
import { v4 as uuid } from 'uuid';
import { convertTableData,
         convertHeadingData,
         debug,
         generateFilter,
         structureFieldsAuto,
         structureFieldsUsingProp } from "./TableUtils"


export interface Props {
  debug?: boolean,
  endpoint: string,
  baseUrl?: string,
  fields?: Fields,
  fixedFilter?: object,
  includeNav?: boolean
}

export interface State {
  tableData: any[],
  headings: any[],
  page: number,
  sizePerPage: number,
  totalSize: number,
  error: boolean,
  loading: boolean,
  renderTimes: number
}

class AutoTable extends React.Component<Props, State> {
  id = "tol-table-" + uuid()
  constructor(props: Props) {
    const headingsDefault = [{
      dataField: '',
      text: '‎'
    }]
    super(props);
    this.state = {
      tableData: [],
      headings: headingsDefault,
      page: 1,
      sizePerPage: 50,
      totalSize: -1,
      error: false,
      loading: false,
      renderTimes: 0
    }
  }

  refreshPagination = () => {
    const { page, sizePerPage } = this.state;
    this.handleTableChange('pagination', { page: page, sizePerPage: sizePerPage })
  }

  componentDidMount() {
    this.refreshPagination()
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.fixedFilter !== this.props.fixedFilter) {
      this.refreshPagination()
    }
  }

  handleTableChange = (_type: string, { page, sizePerPage, filters, sortOrder, sortField } : {
    page: number,
    sizePerPage: number,
    filters?: object,
    sortOrder?: string,
    sortField?: string
  }) => {
    // used to update the table state indicator
    if (this.state.renderTimes >= 1) {
      this.setState({
        renderTimes: 2,
        loading: true
      })
    }
    let apiFilters: object = {};

    // always on filtering - (contains, exact, range)
    if (this.props.fixedFilter !== undefined) {
      apiFilters = Object.assign(apiFilters, this.props.fixedFilter)
    }

    // column specific filtering
    generateFilter(apiFilters, filters)

    // sorting
    if (sortOrder === 'desc') {
      sortField = '-' + sortField
    }

    // get data and update state
    httpClient().get('/' + this.props.endpoint, {
      params: {
        page: page,
        page_size: sizePerPage,
        filter: apiFilters,
        sort_by: sortField
      },
      baseURL: this.props.baseUrl
      })
      .then((res: any) => {
        const apiData = res.data.data
        const apiMeta = res.data.meta
        this.setState({
          page: page,
          sizePerPage: sizePerPage,
          totalSize: apiMeta.total,
          error: false
        })
        
        // error if endpoint doesn't return 200
        if (res.status !== 200) {
          throw Error()
        }

        this.setState(() => ({
          tableData: [],
          loading: false
        }));

        // check if any data is returned
        if (apiData[0] !== undefined) {
          let fieldMeta = {};

          // checking if 'fields' has been defined
          if (this.props.fields !== undefined) {
            fieldMeta = structureFieldsUsingProp(this.props.fields, apiMeta.types)
          } else {
            if ('attributes' in apiData[0]) {
              const attributes = structureFieldsAuto(
                apiData[0].attributes,
                apiMeta.types,
                true
              )
              fieldMeta = Object.assign(fieldMeta, attributes)
            }
            if ('relationships' in apiData[0]) {
              const relationships = structureFieldsAuto(
                apiData[0].relationships,
                apiMeta.types,
                false,
                this.props.debug
              )
              fieldMeta = Object.assign(fieldMeta, relationships)
            }
          }

          // debug logs if prop defined
          debug(
            apiData,
            fieldMeta,
            this.props.debug
          )

          // only updating heading state on first load
          if (this.state.renderTimes === 0) {
            this.setState({
              headings: convertHeadingData(fieldMeta),
              renderTimes: 1
            })
          }
          this.setState({
            tableData: convertTableData(apiData, fieldMeta)
          })
        }
      })
      // @ts-ignore
      .catch((_: any) => {
        console.warn('Please ensure the db has been restored')
        console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
        this.setState({
          loading: false,
          error: true,
          tableData: []
        })
      }
    )
  }

  render() {
    const { tableData,
            headings,
            page,
            sizePerPage,
            totalSize,
            renderTimes,
            loading,
            error } = this.state;
    
    // show nav as default
    let includeNav = this.props.includeNav;
    if (includeNav === undefined) {
      includeNav = true
    }

    // need to be blank on first render
    let tableStatusIndicatorOrBlank: JSX.Element;
    if (renderTimes === 0) {
      tableStatusIndicatorOrBlank = <TableEmpty />
    } else {
      tableStatusIndicatorOrBlank = tableStatusIndicator(error)
    }

    return (
      <div>
        {(() => {
          return (
            <Table
              id={ this.id }
              data={ tableData }
              columns={ headings }
              onTableChange={ this.handleTableChange }
              page={ page }
              sizePerPage={ sizePerPage }
              totalSize={ totalSize }
              includeNav={ includeNav }
              loading={ loading }
              tableStatusIndicator={ tableStatusIndicatorOrBlank }
            />
          )
        })()}
      </div>
    );
  }
}

export default AutoTable;
