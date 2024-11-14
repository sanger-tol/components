/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from "../services/http/httpClient";
import { FieldMetaData, FieldMeta } from "./Field";
import {
  createSort,
  getFieldMetaFromStorage,
  setFieldMetaAttributeInStorage,
  convertTableData,
  tableDebug,
  structureFieldMeta,
} from "./Utils";
import Table, { NumRows } from "./Table";
import { Placeholder, TsDataSource } from "../index";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { Zone } from "../board";
import {
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow,
} from "../filtering/Utils";
import RemoteRowCounter from "./RemoteRowCounter";


interface Props {
  id: string;
  endpoint: string;
  baseUrl?: string;
  attributeMetadataUrl?: string;
  relationshipsUrl?: string;

  fields?: FieldMetaData;
  height?: any;
  basic?: boolean;
  forceUpdate?: boolean;

  zone: object;
  setZone: any;
  defaultSort?: string;
  pageSize?: NumRows | number;
  displaySource?: boolean;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  rowSelection?: boolean;

  debug?: boolean;
}

function RemoteTable(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
    fields,
    basic,
    forceUpdate,
    zone,
    setZone,
    defaultSort,
    displaySource,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    rowSelection,
    debug,
  } = props;
  const ds = new TsDataSource({ baseUrl });
  const height = props.height !== undefined ? props.height : "100%";

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta | null>(null);

  // pagination
  const getPageSize = () => {
    const size = getFieldMetaFromStorage(id, fields, "pageSize");
    return size ?? props.pageSize ?? 50;
  };
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(getPageSize());
  const [totalSize, setTotalSize] = useState<number>(0);

  // filtering/sorting
  const [filter, setFilter] = useState<object | undefined>({});
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortType, setSortType] = useState<string>("asc");

  // loading, error and warning info
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [zone]);

  useEffectUpdate(() => {
    renderTable();
  }, [page, sortColumn, sortType, filter, forceUpdate]);

  useEffectUpdate(() => {
    setFieldMetaAttributeInStorage(id, pageSize, "pageSize");
    if (page === 1) renderTable();
    // setting page then triggers renderTable in useEffect above
    setPage(1);
  }, [pageSize]);

  const modalOnSave = (fieldMeta: FieldMeta) => {
    setFieldMeta(fieldMeta);
    resetFiltersBelow({
      id: id,
      zone: zone as Zone,
      indexOffset: -1,
    });
    setZone({ ...zone });
    // setting localFilter then triggers renderTable in useEffect above
    setFieldMetaAttributeInStorage(id, fieldMeta.data, "data");
    setFieldMetaAttributeInStorage(id, fieldMeta.order, "order");
  };

  const renderTable = () => {
    setLoading(true);
    // generating query params
    const params = {
      page: page,
      page_size: pageSize,
      filter: filter,
    };

    // deal with sorting
    if (sortColumn !== "") {
      params["sort_by"] = createSort(sortColumn, sortType);
    } else if (defaultSort !== undefined) {
      params["sort_by"] = defaultSort;
    }

    // get data and update state
    httpClient()
      .get("/" + endpoint, {
        params: params,
        baseURL: baseUrl,
      })
      .then(async (res: any) => {
        // error if endpoint doesn't return 200
        if (res.status !== 200) throw Error();
        const apiData = res.data.data;
        const apiMeta = res.data.meta;

        // get attribute types and relationship links
        const entityMeta =
          basic !== true ? await ds.getEntityMeta() : undefined;

        setPage(page);
        setTotalSize(apiMeta.total);
        setError("");

        // updating fieldMeta
        let savedFieldMeta = getFieldMetaFromStorage(id, fields) as FieldMeta;
        if (initialLoad) {
          savedFieldMeta = structureFieldMeta(
            endpoint,
            getFieldMetaFromStorage(id, fields),
            entityMeta,
            fields,
            props.pageSize
          );
          setFieldMetaAttributeInStorage(id, savedFieldMeta);
        }
        setFieldMeta(savedFieldMeta);
        setPageSize(savedFieldMeta.pageSize);

        // debug logs if prop defined
        tableDebug(apiData, savedFieldMeta, debug);

        // setting data using fieldMeta
        setData(convertTableData(apiData, savedFieldMeta, baseUrl));
        setLoading(false);
        setInitialLoad(false);
      })
      .catch((error: any) => {
        setError(error.message);
        setLoading(false);
        setInitialLoad(false);
        setData([]);
        console.warn(error);
        console.warn("Please ensure the db has been restored");
        console.warn(
          "Please ensure the 'endpoint' prop is correct and pluralised"
        );
      });
  };

  if (error !== "") {
    return (
      <Placeholder
        errorMessage={error}
        height={height}
      />
    );
  }

  if (initialLoad) {
    return (
      <Placeholder
        loader
        height={height}
      />
    );
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
      rowCounter={
        <RemoteRowCounter
          totalSize={totalSize}
          filter={filter}
          loading={loading}
          {...props}
        />
      }
      displaySource={displaySource}
      sortColumn={sortColumn}
      sortType={sortType}
      defaultSort={defaultSort}
      handleSortColumn={handleSortColumn}
      zone={zone as Zone}
      setZone={setZone}
      filter={filter}
      modalOnSave={modalOnSave}
      noFilter={noFilter}
      noPagination={noPagination}
      noSorting={noSorting}
      noConfigModal={noConfigModal}
      noDownload={noDownload}
      rowSelection={rowSelection}
    />
  );
}

export default RemoteTable;
