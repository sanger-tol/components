/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { API_METHODS, API_OPERATIONS, buildDataRecords, buildFieldMetaDefaults, useComponentData, useQueryData } from "..";
import type { IFieldMeta, IUseComponentData, TCustomDataPointRenderers, TDataObjectListOrNull, TDataRecordList, TsDataSource } from "..";


/** Parameters for the `useComponentListData` hook. */
export interface IUseComponentListData extends Omit<IUseComponentData<IFieldMeta>, "fetchData"> {
  /** The object type the fields belong to. */
  objectType: string;
  /** Data source used to fetch each field's attribute descriptor and the page of data. */
  dataSource: TsDataSource;
  /** The fields to enrich with metadata from `getAttributeDescriptor`, and to request from `getListPage`. */
  fields: IFieldMeta;
  /** The initial page to fetch; pagination state is then managed internally by this hook. */
  page?: number;
  /** The initial number of results to fetch per page; pagination state is then managed internally by this hook. */
  pageSize?: number;
  /** Sort string passed straight to `getListPage`. */
  sortBy?: string;
  /** Custom cell renderers to use in addition to the pre-defined ones when building the returned `data`. */
  customCellRenderers?: TCustomDataPointRenderers;
}

/**
 * Builds `IFieldMeta` for an arbitrary set of fields by fetching each field's `IAttributeDescriptor`
 * via `dataSource.getAttributeDescriptor`, the same way `RemoteTable` enriches its columns via
 * `addFieldMetaDefaults` - generalised so any component that needs field metadata can use it, not just tables.
 * Once the fields are resolved, fetches the actual page of data via `dataSource.getListPage`.
 *
 * Extends `IUseComponentData`, so it supports everything `useComponentData` does (zone/filter syncing,
 * `forceUpdate`, etc.) for the fields; the data page reuses that same resolved `filter`.
 *
 * Also manages its own `page`/`pageSize` state (seeded from the given initial values) and fetches the
 * matching total row count, so the result can be spread straight into `RemoteComponentBase` for pagination.
 */
export function useComponentListData({
  id,
  objectType,
  dataSource,
  fields,
  page: initialPage = 1,
  pageSize: initialPageSize = 1,
  sortBy,
  customCellRenderers,
  queryKey = [],
  ...rest
}: IUseComponentListData) {
  const allAttributes = fields.order.active.concat(fields.order.inactive || []);

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const {
    filter,
    data: fieldMeta,
    isLoading: isLoadingFields,
    errorMessage: fieldsErrorMessage,
  } = useComponentData<IFieldMeta>({
    ...rest,
    id,
    queryKey: [...allAttributes, "fields", ...queryKey],
    fetchData: async () => ({
      ...fields,
      dataWithDefaults: await buildFieldMetaDefaults(objectType, allAttributes, dataSource, fields.dataWithDefaults),
    }),
  });

  const {
    data: totalSize,
    isLoading: isLoadingTotalSize,
  } = useQueryData<number>(
    [id, "listPageCount", JSON.stringify(filter)],
    () =>
      dataSource
        .custom({ method: API_METHODS.POST, resource: `${objectType}${API_OPERATIONS.COUNT}`, body: { filter } })
        .then((res: any) => res?.data?.meta?.total ?? 0),
    { enabled: !isLoadingFields },
  );

  const {
    data: dataObjects,
    isLoading: isLoadingData,
    isError,
    error,
  } = useQueryData<TDataObjectListOrNull>(
    [id, "listPage", JSON.stringify(filter), String(page), String(pageSize), String(sortBy)],
    () => dataSource.getListPage({ objectType, page, pageSize, filter, sortBy, requestedFields: allAttributes }),
    {
      enabled: !isLoadingFields && !isLoadingTotalSize,
      // TODO: Investigate targeted cache invalidation for editable data points.
      gcTime: 0,
    },
  );

  const data: TDataRecordList = buildDataRecords(dataObjects, dataSource, fieldMeta as IFieldMeta, customCellRenderers);

  return {
    fieldMeta: (fieldMeta as IFieldMeta),
    data,
    // Waits for all necessary data to be loaded: field metadata, total size, and the current page of data.
    isLoading: isLoadingFields || isLoadingTotalSize || isLoadingData,
    errorMessage: fieldsErrorMessage ?? (isError ? (error?.message ?? "An error occurred") : undefined),
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize: (totalSize as number) ?? 0,
  };
}

