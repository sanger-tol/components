/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import {
  ObjectDetail,
  DataPoint,
} from "..";
import type {
  ICustomCellRenderers,
  IRemoteObjectDetailField,
  IRemoteTarget,
  PObjectDetail
} from "..";

export interface PRemoteObjectDetail extends IRemoteTarget, Omit<PObjectDetail, "data" | "contents"> {
  /**
   * Configuration for the fields to display in the object detail
   */
  fields: IRemoteObjectDetailField[];
  /**
   * Custom cell renderers for specific field types
   */
  customDataPointRenderers?: ICustomCellRenderers;
}

export function RemoteObjectDetail(props: PRemoteObjectDetail) {
  const {
    id,
    utilityBarConfig,
    height = "100%",
    dataSource,
    objectType,
    fields,
    customDataPointRenderers
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
          nextData[field.displayName ?? field.attribute] = (
            <DataPoint
              parentDataObject={object}
              field={field.attribute}
              dataSource={dataSource}
              renderer={{ type: field.renderer || 'longText' }}
              setExpandedRows={() => { }}
              customCellRenderers={customDataPointRenderers}
              dataObject={object}
            />
          );
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
