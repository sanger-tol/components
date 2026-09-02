/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import {
  UtilityBar,
  TUtilityBarOrNull,
  IRemoteTarget,
  ObjectDetail
} from "..";

interface IRemoteObjectDetailData {
  fields: IRemoteObjectDetailField[];
}


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
    height = "100%"
  } = props;

  return (
    <ObjectDetail
      id={id}
      utilityBarConfig={utilityBarConfig}
      data={data}
      contents={contents}
      height={height}
    />
  );
}
