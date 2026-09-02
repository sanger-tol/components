/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState } from "react";
import {
  TUtilityBarOrNull,
  IRemoteTarget,
  ObjectDetail
} from "..";


// Takes in attribute to get object
// valueFilter is a custom function to transform the value before rendering, this logic can then be passed rather than handled in this component
interface IRemoteObjectDetailField {
  attribute: string;
  displayName?: string;
  valueFilter?: (value: any) => ReactNode;
}

export interface PRemoteObjectDetail extends IRemoteTarget {
  height?: string;
  id: string;
  utilityBarConfig?: TUtilityBarOrNull;
  fields: IRemoteObjectDetailField[];
}

export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  const {
    id,
    utilityBarConfig,
    height = "100%",
    dataSource,
    objectType,
    fields
  } = props;
  const [data, setData] = useState<Record<string, ReactNode>>({});

  dataSource.getOne({
    objectType,
    id
  }).then((object: any) => {
    for (const field of fields) {
      const value = object[field.attribute];
      setData(prevData => ({
        ...prevData,
        [field.displayName ?? field.attribute]: field.valueFilter ? field.valueFilter(object) : value
      }));
    }
  });

  return (
    <ObjectDetail
      id={id}
      utilityBarConfig={utilityBarConfig}
      data={data}
      height={height}
    />
  );
}
