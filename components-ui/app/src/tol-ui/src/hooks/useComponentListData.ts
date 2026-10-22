/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useMemo, useState } from "react";
import { API_METHODS, API_OPERATIONS, buildDataRecords, buildFieldMetaDefaults, useComponentData, useQueryData } from "..";
import type { IFieldMeta, IUseComponentData, TCustomDataPointRenderers, TDataObjectListOrNull, TDataRecordList, TsDataSource } from "..";


/** Parameters for the `useComponentListData` hook. */
export interface IUseComponentListData extends Omit<IUseComponentData, "fetchData"> {
  /** The object type the fields belong to. */
  objectType: string;
  /** Data source used to fetch each field's attribute descriptor and the page of data. */
  dataSource: TsDataSource;
  /** The fields to enrich with metadata from `getAttributeDescriptor`, and to request from `getListPage`. */
  fields?: IFieldMeta;
  /** The initial page to fetch; pagination state is then managed internally by this hook. */
  page?: number;
  /** Configured number of results per page; changes reset pagination to the first page. */
  pageSize?: number;
  /** Sort string passed straight to `getListPage`. */
  sortBy?: string;
  /** Custom data point renderers to use in addition to the pre-defined ones when building the returned `data`. */
  customDataPointRenderers?: TCustomDataPointRenderers;
  /** To adapt the fieldMeta for display purposes without affecting the underlying configuration. */
  manipulateViewableFieldMeta?: (fieldMeta: IFieldMeta, dataObjects?: TDataObjectListOrNull) => IFieldMeta;
}

/**
 * Fetches a page of list data for a set of fields, along with the field meta needed to render it.
 *
 * - Field meta is built from each field's `IAttributeDescriptor` via `dataSource.getAttributeDescriptor`,
 *   then the page of data is fetched via `dataSource.getListPage` using the same resolved `filter`.
 * - Extends `IUseComponentData`, so zone/filter syncing, `forceUpdate`, etc. work as in `useComponentData`.
 * - Manages its own `page`/`pageSize` state and fetches the total row count.
 *
 * `manipulateViewableFieldMeta` adjusts what is displayed. Its result is returned as `fieldMeta`; the original is
 * returned as `unmanipulatedFieldMeta`. Use the unmanipulated field meta for config (e.g. a config drawer)
 * so display-only changes are never saved.
 */
export function useComponentListData({
  id,
  objectType,
  dataSource,
  fields,
  page: initialPage = 1,
  pageSize: initialPageSize = 50,
  sortBy,
  customDataPointRenderers,
  manipulateViewableFieldMeta,
  queryKey = [],
  ...rest
}: IUseComponentListData) {
  const allAttributes = fields ? fields.order.active.concat(fields.order.inactive || []) : [];
  const noFieldsSelected = allAttributes.length === 0;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const {
    filter,
    data: fetchedFieldMeta,
    isLoading: isLoadingFields,
    errorMessage: fieldsErrorMessage,
  } = useComponentData<IFieldMeta>({
    ...rest,
    id,
    queryKey: [
      ...allAttributes,
      JSON.stringify([fields?.data, fields?.dataWithDefaults]),
      "fields",
      ...queryKey,
    ],
    // Guarded by noFieldsSelected, so fields is guaranteed to be set whenever this actually runs.
    fetchData: async () => buildFieldMetaDefaults(objectType, allAttributes, dataSource, fields!),
    enabled: !noFieldsSelected,
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
    // No fields means no valid request to make, so skip it entirely rather than letting the API reject it.
    { enabled: !isLoadingFields && !noFieldsSelected },
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
      enabled: !isLoadingFields && !isLoadingTotalSize && !noFieldsSelected,
      // TODO: Investigate targeted cache invalidation for editable data points.
      gcTime: 0,
    },
  );

  const fieldMeta = useMemo(
    () => (
      fetchedFieldMeta && manipulateViewableFieldMeta
        ? manipulateViewableFieldMeta(fetchedFieldMeta, dataObjects)
        : fetchedFieldMeta
    ),
    [fetchedFieldMeta, manipulateViewableFieldMeta, dataObjects],
  );

  const data: TDataRecordList = noFieldsSelected
    ? []
    : buildDataRecords(dataObjects, dataSource, fieldMeta, customDataPointRenderers);

  return {
    fieldMeta,
    unmanipulatedFieldMeta: fetchedFieldMeta,
    data,
    noFieldsSelected,
    // Waits for all necessary data to be loaded: field metadata, total size, and the current page of data.
    isLoading: isLoadingFields || (!noFieldsSelected && (isLoadingTotalSize || isLoadingData)),
    errorMessage: fieldsErrorMessage ?? (isError ? (error?.message ?? "An error occurred") : undefined),
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize: noFieldsSelected ? 0 : ((totalSize as number) ?? 0),
  };
}

