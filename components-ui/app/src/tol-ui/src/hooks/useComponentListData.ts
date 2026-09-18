/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { buildFieldMetaDefaults, useComponentData, useQueryData } from "..";
import type { IFieldMeta, IUseComponentData, TDataObjectListOrNull, TsDataSource } from "..";


/** Parameters for the `useComponentListData` hook. */
export interface IUseComponentListData extends Omit<IUseComponentData<IFieldMeta>, "fetchData"> {
  /** The object type the fields belong to. */
  objectType: string;
  /** Data source used to fetch each field's attribute descriptor and the page of data. */
  dataSource: TsDataSource;
  /** The fields to enrich with metadata from `getAttributeDescriptor`, and to request from `getListPage`. */
  fields: IFieldMeta;
  /** The page of results to fetch. */
  page: number;
  /** The number of results to fetch per page. */
  pageSize: number;
  /** Sort string passed straight to `getListPage`, e.g. from `createSort`. */
  sortBy?: string;
}

/**
 * Builds `IFieldMeta` for an arbitrary set of fields by fetching each field's `IAttributeDescriptor`
 * via `dataSource.getAttributeDescriptor`, the same way `RemoteTable` enriches its columns via
 * `addFieldMetaDefaults` - generalised so any component that needs field metadata can use it, not just tables.
 * Once the fields are resolved, fetches the actual page of data via `dataSource.getListPage`.
 *
 * Extends `IUseComponentData`, so it supports everything `useComponentData` does (zone/filter syncing,
 * `forceUpdate`, etc.) for the fields; the data page reuses that same resolved `filter`.
 */
export function useComponentListData({
  id,
  objectType,
  dataSource,
  fields,
  page,
  pageSize,
  sortBy,
  queryKey = [],
  ...rest
}: IUseComponentListData) {
  const attributes = fields.order.active.concat(fields.order.inactive || []);

  const {
    filter,
    data: fieldMeta,
    isLoading: isLoadingFields,
    errorMessage: fieldsErrorMessage,
  } = useComponentData<IFieldMeta>({
    ...rest,
    id,
    queryKey: [...attributes, "fields", ...queryKey],
    fetchData: async () => ({
      ...fields,
      dataWithDefaults: await buildFieldMetaDefaults(objectType, attributes, dataSource, fields.dataWithDefaults),
    }),
  });

  const {
    data,
    isLoading: isLoadingData,
    isError,
    error,
  } = useQueryData<TDataObjectListOrNull>(
    [id, "listPage", JSON.stringify(filter), String(page), String(pageSize), String(sortBy)],
    () => dataSource.getListPage({ objectType, page, pageSize, filter, sortBy, requestedFields: attributes }),
    { enabled: !isLoadingFields },
  );

  return {
    fieldMeta: (fieldMeta as IFieldMeta),
    data,
    isLoading: isLoadingFields || isLoadingData,
    errorMessage: fieldsErrorMessage ?? (isError ? (error?.message ?? "An error occurred") : undefined),
  };
}
