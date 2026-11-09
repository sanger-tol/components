/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentBase, getField } from "..";
import type { IComponentData, TObjectDetailKeyType } from "..";


/** Specific options for the `ObjectDetail` component. */
export interface PObjectDetailOptions {
  /** How to display field keys alongside their values. Defaults to "standard". */
  keyType?: TObjectDetailKeyType;
}

/** Props for the `ObjectDetail` component including base component data. */
export interface PObjectDetail extends PObjectDetailOptions, IComponentData {}

export function ObjectDetail(props: PObjectDetail) {
  const { fields, data = {}, classNames = [], keyType = "standard", ...rest } = props;

  const activeFields = fields?.order?.active ?? [];
  const hasPositions = activeFields.some((attribute) => {
    const field = fields ? getField(fields, attribute) : undefined;
    return field && "position" in field;
  });
  const leftFields = activeFields.filter((attribute) => {
    const field = fields ? getField(fields, attribute) : undefined;
    return !field || !("position" in field) || field.position === "left";
  });
  const rightFields = activeFields.filter((attribute) => {
    const field = fields ? getField(fields, attribute) : undefined;
    return field && "position" in field && field.position === "right";
  });

  const renderField = (attribute: string) => {
    const field = fields ? getField(fields, attribute) : undefined;
    const key = field?.rename ?? attribute;
    return (
      <div
        key={attribute}
        className={`tol-object-detail-field${keyType === "heading" ? " tol-object-detail-field--heading" : ""}`}
      >
        {keyType === "standard" && <strong>{key}:</strong>}
        {keyType === "heading" && <h6>{key}</h6>}
        {data[attribute]}
      </div>
    );
  };

  return (
    <ComponentBase
      {...rest}
      className="with-overflow"
    >
      <div className={`tol-object-detail${hasPositions ? " tol-object-detail--columns" : ""}`}>
        {hasPositions ? (
          <>
            <div className="tol-object-detail-column">{leftFields.map(renderField)}</div>
            <div className="tol-object-detail-column tol-object-detail-column--right">
              {rightFields.map(renderField)}
            </div>
          </>
        ) : activeFields.map(renderField)}
      </div>
    </ComponentBase>
  );
}
