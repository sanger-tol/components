/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentBase, getField } from "..";
import type { IComponentData } from "..";


/** Props for the `ObjectDetail` component. */
export interface PObjectDetailOptions {
  /** Whether to display field keys alongside their values. Defaults to true. */
  showKeys?: boolean;
}

export interface PObjectDetail extends PObjectDetailOptions, IComponentData {}

export function ObjectDetail(props: PObjectDetail) {
  const { fields, data = {}, classNames = [], showKeys = true, ...rest } = props;

  return (
    <ComponentBase
      {...rest}
      className="with-overflow"
    >
      <div className="tol-object-detail">
        {fields?.order?.active?.map((attribute) => {
          const field = getField(fields, attribute);
          return (
            <div key={attribute} className="tol-object-detail-field">
              {showKeys && <strong>{field?.rename ?? attribute}:</strong>}
              {data[attribute]}
            </div>
          );
        })}
      </div>
    </ComponentBase>
  );
}
