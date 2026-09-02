/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import {
  TUtilityBarOrNull,
  IRemoteTarget,
  ObjectDetail,
  IRemoteObjectDetailField
} from "..";

export interface PRemoteObjectDetail extends IRemoteTarget {
  /**
   * The height of the object detail component
   */
  height?: string;
  /**
   * ID of the Object to display
   */
  id: string;
  /**
   * Configuration for the utility bar
   */
  utilityBarConfig?: TUtilityBarOrNull;
  /**
   * Configuration for the fields to display in the object detail
   */
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

  useEffect(() => {
    dataSource
      .getOne({ objectType, id })
      .then((object) => {
        if (object === null) {
          setData({});
          return;
        }

        const nextData: Record<string, ReactNode> = {};
        for (const field of fields) {
          const value = object[field.attribute] || "None";
          nextData[field.displayName ?? field.attribute] = field.valueFilter
            ? field.valueFilter(object)
            : value;
        }

        setData(nextData);
      });
  }, []);

  return (
    <ObjectDetail
      id={id}
      utilityBarConfig={utilityBarConfig}
      data={data}
      height={height}
    />
  );
}
