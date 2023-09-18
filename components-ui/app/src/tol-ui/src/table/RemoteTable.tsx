/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { httpClient } from '../services/http/httpClient'
import Table from "./Table";
import { Fields } from "./Field";
import { getTableStatusIndicator } from './TableUtils';
import TableEmpty from "./TableEmpty";
import { v4 as uuid } from 'uuid';
import { convertTableData,
         convertHeadingData,
         debug,
         generateFilter,
         structureFieldsAuto,
         structureFieldsUsingProp,
         setTableHeight } from "./TableUtils"


export interface Props {
  debug?: boolean,
  endpoint: string,
  baseUrl?: string,
  fields?: Fields,
  filter?: object,
  defaultSort?: string,
  noNav?: boolean,
  noConfigModal?: boolean,
  height?: number
}

export interface State {
  tableData: any[],
  headings: any[],
  page: number,
  sizePerPage: number,
  totalSize: number,
  error: string,
  loading: boolean,
  renderTimes: number,
  fieldMeta: object
}

class RemoteTable extends React.Component<Props, State> {
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
      sizePerPage: 100,
      totalSize: -1,
      error: 'false',
      loading: false,
      renderTimes: 0,
      fieldMeta: {}
    }
  }

  refreshPagination = (pageNumber?: number) => {
    let { page, sizePerPage } = this.state;
    // reset to a set page
    if (pageNumber !== undefined) {
      page = pageNumber
    }
    this.handleTableChange('pagination', {
      page: page,
      sizePerPage: sizePerPage,
    })
  }

  componentDidMount() {
    this.refreshPagination()
    setTableHeight(this.id, this.props.height)
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.filter !== this.props.filter) {
      this.refreshPagination(1)
    }
    // ensure the table size doesn't change - slight workaround
    if (this.state.renderTimes < 2) {
      setTableHeight(this.id, this.props.height)
    }
  }

  modalOnSave = (fieldMeta: object) => {
    this.setState({
      fieldMeta: fieldMeta
    })
    this.refreshPagination(1)
  }

  handleTableChange = (_type: string, { page, sizePerPage, filters, sortOrder, sortField } : {
    page: number,
    sizePerPage: number,
    filters?: object,
    sortOrder?: string,
    sortField?: string
  }) => {
    // allow default sort
    if (sortField === undefined || sortField === null) {
      sortField = this.props.defaultSort
    }
    // used to update the table state indicator
    if (this.state.renderTimes >= 1) {
      this.setState({
        renderTimes: 2,
        loading: true
      })
    }
    let apiFilters: object = {};

    // always on filtering - (contains, exact, range)
    if (this.props.filter !== undefined) {
      apiFilters = Object.assign(apiFilters, this.props.filter)
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
          error: ''
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
          let fieldPropDefined = this.props.fields !== undefined;

          // checking if 'fields' has been defined
          if (fieldPropDefined) {
            fieldMeta = structureFieldsUsingProp(this.props.fields!, apiMeta.types)
          }

          // auto add all fields in api call - if fields specified, extras are hidden
          if ('attributes' in apiData[0]) {
            const attributes = structureFieldsAuto(
              apiData[0].attributes,
              apiMeta.types,
              fieldMeta,
              true,
              fieldPropDefined
            )
            fieldMeta = Object.assign(fieldMeta, attributes)
          }
          if ('relationships' in apiData[0]) {
            const relationships = structureFieldsAuto(
              apiData[0].relationships,
              apiMeta.types,
              fieldMeta,
              false,
              fieldPropDefined,
              this.props.debug
            )
            fieldMeta = Object.assign(fieldMeta, relationships)
          }

          // debug logs if prop defined
          debug(
            apiData,
            fieldMeta,
            this.props.debug
          )

          // only setting fieldMeta state on first load
          if (this.state.renderTimes === 0) {
            this.setState({
              fieldMeta: fieldMeta,
              renderTimes: 1
            })
          }
          this.setState({
            headings: convertHeadingData(fieldMeta),
            tableData: convertTableData(apiData, fieldMeta, this.props.baseUrl)
          })
        }
      })
      // @ts-ignore
      .catch((error: any) => {
        console.warn(error.message)
        console.warn('Please ensure the db has been restored')
        console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
        this.setState({
          loading: false,
          error: error.message,
          tableData: [],
          renderTimes: 1
        })
      }
    )
  }

  render() {
    const { tableData,
            headings,
            page,
            fieldMeta,
            sizePerPage,
            totalSize,
            renderTimes,
            loading,
            error } = this.state;

    // need to be blank on first render
    let tableStatusIndicator: JSX.Element;
    if (renderTimes === 0) {
      tableStatusIndicator = <TableEmpty />
    } else {
      tableStatusIndicator = getTableStatusIndicator(error)
    }

    return (
      <Table
        id={ this.id }
        data={ tableData }
        columns={ headings }
        fieldMeta={fieldMeta}
        onTableChange={ this.handleTableChange }
        page={ page }
        sizePerPage={ sizePerPage }
        totalSize={ totalSize }
        noNav={ this.props.noNav }
        noConfigModal={ this.props.noConfigModal }
        loading={ loading }
        tableStatusIndicator={ tableStatusIndicator }
        modalOnSave={ this.modalOnSave }
      />
    )
  }
}

export default RemoteTable;
