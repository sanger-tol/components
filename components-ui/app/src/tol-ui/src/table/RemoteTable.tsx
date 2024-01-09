/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from '../services/http/httpClient';
import { FieldMetaData, FieldMeta, initialiseFieldMeta } from "./Field";
import { createSort,
  getFieldMetaAttributeFromStorage,
  getTypesMeta,
  setFieldMetaAttributeInStorage } from './TableUtils';
import { convertTableData,
  tableDebug,
  structureFieldMeta } from "./TableUtils";
import Table from "./Table";
import { Placeholder } from "../index";
import { useEffectUpdate } from "../hooks/useEffectUpdate";


interface Props {
  id: string,
  endpoint: string,
  baseUrl?: string,
  fields?: FieldMetaData,
  height?: number,

  filter?: object,
  setFilter?: Function, // eslint-disable-line
  defaultSort?: string,

  noFilter?: boolean,
  noPagination?: boolean,
  noSorting?: boolean
  noConfigModal?: boolean,
  noDownload?: boolean,

  debug?: boolean
}

function RemoteTable(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
    fields,
    filter,
    setFilter,
    defaultSort,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    debug
  } = props;
  const height = (props.height !== undefined) ? props.height : 600;

  // debug clears all storage
  if (debug) localStorage.clear();

  // retrieve saved field meta
  const storedFieldMeta = getFieldMetaAttributeFromStorage(id, fields);

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta|null>(storedFieldMeta);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(
    (storedFieldMeta !== null) ? storedFieldMeta.pageSize : 50
  );
  const [totalSize, setTotalSize] = useState<number>(0);

  // sorting
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortType, setSortType] = useState<string>('asc');

  // loading, error and warning info
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true); 
  const [error, setError] = useState<string>('');

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  useEffect(() => {
    renderTable();
  }, [page, sortColumn, sortType]);

  useEffectUpdate(() => {
    setFieldMetaAttributeInStorage(id, pageSize, 'pageSize');
  }, [pageSize]);

  useEffectUpdate(() => {
    if (page === 1) renderTable();
    // setting page then triggers renderTable in useEffect above
    setPage(1);
  }, [filter, pageSize]);

  const modalOnSave = (fieldMeta: FieldMeta) => {
    setFieldMeta(fieldMeta);
    // setting page then triggers renderTable in useEffect above
    setPage(1);
    setFieldMetaAttributeInStorage(id, fieldMeta.data, 'data');
    setFieldMetaAttributeInStorage(id, fieldMeta.order, 'order');
  };

  const renderTable = async () => {
    setLoading(true);

    // generating query params
    const params = {
      page: page,
      page_size: pageSize,
      filter: filter
    };

    // deal with sorting
    if (sortColumn !== '') {
      params['sort_by'] = createSort(sortColumn, sortType);
    } else if (defaultSort !== undefined) {
      params['sort_by'] = defaultSort;
    }

    // get attribute types and relationship links
    const typesMeta = await getTypesMeta(baseUrl);

    // get data and update state
    httpClient().get('/' + endpoint, {
      params: params,
      baseURL: baseUrl
    }).then((res: any) => {
      const apiData = res.data.data;
      const apiMeta = res.data.meta;

      setPage(page);
      setTotalSize(apiMeta.total);
      setError('');
      
      // error if endpoint doesn't return 200
      if (res.status !== 200) throw Error();

      let initialFieldMeta: FieldMeta = initialiseFieldMeta();
      // check if any data is returned
      if (apiData[0] !== undefined) {
        // only setting fieldMeta on first load
        if (fieldMeta === null) {
          initialFieldMeta = structureFieldMeta(
            endpoint,
            initialFieldMeta,
            typesMeta,
            fields
          );
          setFieldMetaAttributeInStorage(id, initialFieldMeta);
        } else {
          initialFieldMeta = getFieldMetaAttributeFromStorage(id, fields);
        }

        // setting fieldMeta only on first load
        setFieldMeta(initialFieldMeta);
      
        // debug logs if prop defined
        tableDebug(
          apiData,
          initialFieldMeta,
          debug
        );

        // setting data using fieldMeta state
        setPageSize(initialFieldMeta.pageSize);
        setData(
          convertTableData(
            apiData,
            initialFieldMeta,
            baseUrl
          )
        );
        setLoading(false);
        setInitialLoad(false);
      } else {
        setData([]);
        setLoading(false);
        setInitialLoad(false);
      }
    }).catch((error: any) => {
      console.warn(error.message);
      console.warn('Please ensure the db has been restored');
      console.warn('Please ensure the \'endpoint\' prop is correct and pluralised');
      setLoading(false);
      setInitialLoad(false);
      setError(error.message);
      setData([]);
    });
  };

  if (error !== ''){
    return (
      <Placeholder
        errorMessage={error}
        height={height}
      />
    );
  }
  
  if (initialLoad) {
    return <Placeholder loader height={height} />;
  }

  return (
    <Table
      id={id}
      data={data}
      fieldMeta={fieldMeta!}
      height={height}
      loading={loading}

      endpoint={endpoint}
      baseUrl={baseUrl}

      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      totalSize={totalSize}

      sortColumn={sortColumn}
      sortType={sortType}
      handleSortColumn={handleSortColumn}

      filter={filter}
      setFilter={setFilter}

      modalOnSave={modalOnSave}

      noFilter={noFilter}
      noPagination={noPagination}
      noSorting={noSorting}
      noConfigModal={noConfigModal}
      noDownload={noDownload}
    />
  );
}

export default RemoteTable;
