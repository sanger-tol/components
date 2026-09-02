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
   /**
   * The ID of the object detail component
   */
  id: string;
   /**
   * The data to be displayed in the object detail component
   */
  data: Record<string, ReactNode>;
   /**
   * The configuration for the utility bar of the object detail component
   */
  utilityBarConfig?: TUtilityBarOrNull;
   /**
   * The contents of the object detail component
   */
  contents?: ReactNode;
   /**
   * The height of the object detail component
   */
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
