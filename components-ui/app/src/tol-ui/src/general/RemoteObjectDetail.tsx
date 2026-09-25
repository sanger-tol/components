/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ObjectDetail,
  RemoteComponentBase,
  useComponentListData,
} from "..";
import type { IRemoteComponentData } from "..";

export function RemoteObjectDetail(props: IRemoteComponentData) {
  const {
    id,
    dataSource,
    objectType,
    fields,
    customDataPointRenderers,
    zone,
    setZone,
    ...rest
  } = props;

  // A single object is just a one-row, one-page list.
  const {
    fieldMeta,
    data,
    isLoading,
    errorMessage,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
  } = useComponentListData({
    id,
    objectType,
    dataSource,
    fields,
    zone,
    setZone,
    customCellRenderers: customDataPointRenderers,
  });

  return (
    <RemoteComponentBase
      {...rest}
      id={id}
      isLoading={isLoading}
      errorMessage={errorMessage}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      totalSize={totalSize}
    >
      <ObjectDetail
        {...rest}
        id={id}
        data={data[0] ?? {}}
        fields={fieldMeta}
      />
    </RemoteComponentBase>
  );
}

