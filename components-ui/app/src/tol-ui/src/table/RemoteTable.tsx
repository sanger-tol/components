/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from '../services/http/httpClient';
import { FieldMetaData, FieldMeta } from "./Field";
import {
  createSort,
  getFieldMetaAttributeFromStorage,
  getTypesMeta,
  setFieldMetaAttributeInStorage
} from './TableUtils';
import { 
  convertTableData,
  tableDebug,
  structureFieldMeta
} from "./TableUtils";
import Table from "./Table";
import { Placeholder } from "../index";
import { useEffectUpdate } from "../hooks/useEffectUpdate";


interface Props {
  id: string,
  endpoint: string,
  baseUrl?: string,
  fields?: FieldMetaData,
  height?: any,
  basic?: boolean,

  filter?: object,
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
    basic,
    filter,
    defaultSort,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    debug
  } = props;
  const height = (props.height !== undefined) ? props.height : "100%";

  // debug clears all storage
  if (debug) localStorage.clear();

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta|null>(null);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalSize, setTotalSize] = useState<number>(0);

  // filtering/sorting
  const [localFilter, setLocalFilter] = useState(
    filter !== undefined ? filter : {}
  );
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
  }, [localFilter, pageSize]);

  // set local filter when incoming change
  useEffectUpdate(() => {
    if (filter !== undefined) {
      setLocalFilter(filter);
    }
  }, [filter]);

  const modalOnSave = (fieldMeta: FieldMeta) => {
    setFieldMeta(fieldMeta);
    // setting localFilter then triggers renderTable in useEffect above
    setLocalFilter((filter !== undefined) ? filter : {});
    setFieldMetaAttributeInStorage(id, fieldMeta.data, 'data');
    setFieldMetaAttributeInStorage(id, fieldMeta.order, 'order');
  };

  const renderTable = () => {
    setLoading(true);

    // generating query params
    const params = {
      page: page,
      page_size: pageSize,
      filter: localFilter
    };

    // deal with sorting
    if (sortColumn !== '') {
      params['sort_by'] = createSort(sortColumn, sortType);
    } else if (defaultSort !== undefined) {
      params['sort_by'] = defaultSort;
    }

    // get data and update state
    httpClient().get('/' + endpoint, {
      params: params,
      baseURL: baseUrl
    }).then(async (res: any) => {
      // error if endpoint doesn't return 200
      if (res.status !== 200) throw Error();
      const apiData = res.data.data;
      const apiMeta = res.data.meta;

      // get attribute types and relationship links
      const typesMeta = (basic !== true && initialLoad) ? await getTypesMeta(baseUrl) : undefined;

      setPage(page);
      setTotalSize(apiMeta.total);
      setError('');

      // setting fieldMeta on first load
      let savedFieldMeta: FieldMeta|null = getFieldMetaAttributeFromStorage(id, fields);
      if (savedFieldMeta === null) {
        savedFieldMeta = structureFieldMeta(
          endpoint,
          typesMeta,
          fields
        );
        setFieldMetaAttributeInStorage(id, savedFieldMeta);
      }
      setFieldMeta(savedFieldMeta);
      setPageSize(savedFieldMeta.pageSize);
    
      // debug logs if prop defined
      tableDebug(
        apiData,
        savedFieldMeta,
        debug
      );

      // setting data using fieldMeta
      setData(
        convertTableData(
          apiData,
          savedFieldMeta,
          baseUrl
        )
      );
      setLoading(false);
      setInitialLoad(false);
    }).catch((error: any) => {
      setError(error.message);
      setLoading(false);
      setInitialLoad(false);
      setData([]);
      console.warn(error.message);
      console.warn('Please ensure the db has been restored');
      console.warn('Please ensure the \'endpoint\' prop is correct and pluralised');
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
      defaultSort={defaultSort}
      handleSortColumn={handleSortColumn}

      filter={localFilter}
      setFilter={setLocalFilter}

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
