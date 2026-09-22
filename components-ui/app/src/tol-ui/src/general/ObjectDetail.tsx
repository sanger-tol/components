/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentBase, getField } from "..";
import type { IComponentData } from "..";


export function ObjectDetail(props: IComponentData) {
  const { fields, data, classNames = [], ...rest } = props;

  return (
    <ComponentBase
      {...rest}
    >
      <div className="tol-object-detail">
        {fields?.order?.active?.map((attribute) => {
          const field = getField(fields, attribute);
          return (
            <div key={attribute} className="tol-object-detail-field">
              <strong>{field?.rename ?? attribute}:</strong> {data[attribute]}
            </div>
          );
        })}
      </div>
    </ComponentBase>
  );
}
