/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from '../services/http/httpClient'
import Table from "./Table";
import { FieldMetaData, FieldMeta, initialiseFieldMeta } from "./FieldMeta";
import { getFieldMetaAttributeFromStorage,
         getTableStatusIndicator,
         setFieldMetaAttributeInStorage,
         setFilterVisibility } from './TableUtils';
import TableEmpty from "./TableEmpty";
import { convertTableData,
         convertHeadingData,
         tableDebug,
         generateFilter,
         structureFieldsAuto,
         structureFieldsUsingProp,
         setTableHeight } from "./TableUtils"


interface TableStateInfo {
  page: number,
  sizePerPage: number,
  filters?: object,
  sortOrder?: string,
  sortField?: string
}

interface Props {
  id: string,
  endpoint: string,
  baseUrl?: string,

  fields?: FieldMetaData,
  filter?: object,
  defaultSort?: string,

  noFilter?: boolean,
  noPagination?: boolean,
  noConfigModal?: boolean,
  noDownload?: boolean,

  height?: number
  debug?: boolean,
}

function RemoteTable(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
    fields,
    filter,
    defaultSort,
    noFilter,
    noPagination,
    noConfigModal,
    noDownload,
    height,
    debug
  } = props

  // debug clears all storage
  if (debug) localStorage.clear()

  // retrieve saved field meta
  const storedFieldMeta = getFieldMetaAttributeFromStorage(props.id, fields)

  const [tableData, setTableData] = useState<any[]>([])
  const [headings, setHeadings] = useState<any[]>([{
    dataField: '',
    text: '‎'
  }])
  const [fieldMeta, setFieldMeta] = useState<FieldMeta|null>(storedFieldMeta)
  const [page, setPage] = useState<number>(1)
  const [sizePerPage, setSizePerPage] = useState<number>(
    (storedFieldMeta !== null) ? storedFieldMeta.pageSize : 50
  )
  const [totalSize, setTotalSize] = useState<number>(-1)
  const [error, setError] = useState<string>('false')
  const [loading, setLoading] = useState<boolean>(false)
  const [renderCount, setRenderCount] = useState<number>(0)
  const [attributesForDownload, setAttributesForDownload] = useState({});

  const renderTable = (pageNumber?: number) => {
    handleTableChange('pagination', {
      page: (pageNumber !== undefined) ? pageNumber : page,
      sizePerPage: sizePerPage,
    })
  }

  useEffect(() => {
    if (renderCount < 2) setTableHeight(id, height)
  })

  useEffect(() => {
    renderTable()
  }, [filter])

  const modalOnSave = (fieldMeta: FieldMeta) => {
    setFieldMeta(fieldMeta)
    renderTable(1)
    setFieldMetaAttributeInStorage(id, fieldMeta.data, 'data')
    setFieldMetaAttributeInStorage(id, fieldMeta.order, 'order')
  }

  const handleTableChange = (_type: string, { page, sizePerPage, filters, sortOrder, sortField }: TableStateInfo) => {
    // allow default sort
    if (sortField === undefined || sortField === null) {
      sortField = defaultSort
    }

    // used to update the table state indicator
    if (renderCount >= 1) {
      setRenderCount(2)
      setLoading(true)
    }

    // always on filtering - (contains, exact, range)
    let apiFilters: object = {};
    if (filter !== undefined) {
      apiFilters = Object.assign(apiFilters, filter)
    }

    // column specific filtering
    generateFilter(apiFilters, filters)

    // sorting
    if (sortOrder === 'desc') {
      sortField = '-' + sortField
    }

    setAttributesForDownload({endpoint, sortField: sortField, apiFilters, baseUrl})

    // get data and update state
    httpClient().get('/' + endpoint, {
      params: {
        page: page,
        page_size: sizePerPage,
        filter: apiFilters,
        sort_by: sortField
      },
      baseURL: baseUrl
    }).then((res: any) => {
      const apiData = res.data.data
      const apiMeta = res.data.meta

      setPage(page)
      setSizePerPage(sizePerPage)
      setTotalSize(apiMeta.total)
      setError('')
      
      // error if endpoint doesn't return 200
      if (res.status !== 200) throw Error()

      setTableData([])
      setLoading(false)

      let initialFieldMeta: FieldMeta = initialiseFieldMeta()
      // check if any data is returned
      if (apiData[0] !== undefined) {
        let isFieldPropDefined = fields !== undefined;

        if (fieldMeta === null) {
          // checking if 'fields' has been defined
          if (isFieldPropDefined) {
            initialFieldMeta = structureFieldsUsingProp(fields!, apiMeta.types)
          }

          // auto add all fields in api call - if fields specified, extras are hidden
          if ('attributes' in apiData[0]) {
            const attributes = structureFieldsAuto(
              apiData[0].attributes,
              apiMeta.types,
              initialFieldMeta,
              true,
              isFieldPropDefined
            )
            initialFieldMeta = Object.assign(initialFieldMeta, attributes)
          }
          if ('relationships' in apiData[0]) {
            const relationships = structureFieldsAuto(
              apiData[0].relationships,
              apiMeta.types,
              initialFieldMeta,
              false,
              isFieldPropDefined,
              debug
            )
            initialFieldMeta = Object.assign(initialFieldMeta, relationships)
          }
          setFieldMetaAttributeInStorage(id, initialFieldMeta)
        } else {
          initialFieldMeta = getFieldMetaAttributeFromStorage(id, fields)
        }
      
        // debug logs if prop defined
        tableDebug(
          apiData,
          initialFieldMeta,
          debug
        )

        // middle load wheel on first load
        if (renderCount === 0) {
          setFieldMeta(initialFieldMeta)
          setRenderCount(1)
        }

        // setting data using fieldMeta state
        setSizePerPage(initialFieldMeta.pageSize)
        setHeadings(convertHeadingData(initialFieldMeta))
        setTableData(
          convertTableData(
            apiData,
            initialFieldMeta,
            baseUrl
          )
        )

        // setting filter visibility
        setFilterVisibility(id)
      }
    }).catch((error: any) => {
      console.warn(error.message)
      console.warn('Please ensure the db has been restored')
      console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
      setLoading(false)
      setError(error.message)
      setTableData([])
      setRenderCount(1)
    })
  }

  // need to be blank on first render
  let tableStatusIndicator: JSX.Element = getTableStatusIndicator(error)
  if (renderCount === 0) tableStatusIndicator = <TableEmpty />

  return (
    <Table
      id={ id }
      data={ tableData }
      columns={ headings }
      fieldMeta={fieldMeta}
      onTableChange={ handleTableChange }
      page={ page }
      sizePerPage={ sizePerPage }
      totalSize={ totalSize }
      noPagination={ noPagination }
      noFilter={ noFilter }
      noConfigModal={ noConfigModal }
      noDownload={ noDownload }
      loading={ loading }
      tableStatusIndicator={ tableStatusIndicator }
      modalOnSave={ modalOnSave }
      attributesForDownload={ attributesForDownload }
    />
  )
}

export default RemoteTable;
