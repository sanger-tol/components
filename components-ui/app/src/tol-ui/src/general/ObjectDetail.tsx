/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import {
  UtilityBar,
  TUtilityBarOrNull,
} from "..";


export interface PObjectDetail {
  id: string;
  data: Record<string, ReactNode>;
  utilityBarConfig?: TUtilityBarOrNull;
  contents?: ReactNode;
  height?: any;
}

export function ObjectDetail(props: PObjectDetail) {
  const {
    id,
    utilityBarConfig,
    data,
    contents,
    height = "100%"
  } = props;

  const KeyValuePairs = Object.entries(data).map(([key, value]) => (
    <p key={key}>
      <strong>{key}:</strong> {value}
    </p>
  ));

  return (
    <div
      className="tol-object-detail"
      id={id}
      style={{
        height: height,
      }}
    >
      {utilityBarConfig &&
        <UtilityBar
          {...utilityBarConfig}
          id={id}
        />
      }
      <div
        className={`tol-component-contents${utilityBarConfig ? " with-offset" : ""}`}
        style={{ overflow: 'auto' }}
      >
        {contents ? contents : KeyValuePairs}
      </div>
    </div>
  );
}
