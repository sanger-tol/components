/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentBase, getField } from "..";
import type { IComponentList } from "..";


export function ObjectDetail(props: IComponentList) {
  const { fields, data, classNames = [], ...rest } = props;

  return (
    <ComponentBase
      {...rest}
      classNames={["tol-object-detail", ...classNames]}
    >
      {fields.order.active.map((attribute) => {
        const field = getField(fields, attribute);
        return (
          <p key={attribute}>
            <strong>{field?.rename ?? attribute}:</strong> {data[attribute]}
          </p>
        );
      })}
    </ComponentBase>
  );
}
