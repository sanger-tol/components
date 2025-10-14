/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  TDataObjectOrNull,
  TCellRenderer,
  Boolean,
  Datetime,
  Expander,
  Float,
  Image,
  Integer,
  Link,
  List,
  Relationship,
  ICustomCellRenderers,
  TsDataSource,
  getCellRendererPropValue,
  Icon
} from "../..";
import { Status } from "./Status";

export interface PCell {
  attribute: string,
  value?: any,
  dataObject: TDataObjectOrNull,
  dataSource?: TsDataSource,
  renderer: TCellRenderer;
  expandedRows: string[];
  setExpandedRows: any,
  customCellRenderers?: ICustomCellRenderers;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer, customCellRenderers, expandedRows, setExpandedRows } = props;
  const [expanded, setExpanded] = useState(false);

  const preDefinedElements = {
    boolean: Boolean,
    datetime: Datetime,
    expander: Expander,
    float: Float,
    image: Image,
    integer: Integer,
    link: Link,
    list: List,
    relationship: Relationship,
    status: Status
  };
  if (
    // renderer type is not defined
    !renderer ||
    !renderer.type ||
    renderer.type === "none" ||
    // no value and not a custom renderer as custom renderers may not require a value
    // no need to to deal with empty values with pre-defined cellRenderers
    (!value && (renderer.type) in preDefinedElements)
  )
    return <>{value}</>;


  const elements = { ...preDefinedElements, ...customCellRenderers };
  renderer.element = elements[renderer.type];

  const elementProps: Record<string, any> = { ...props };

  if (renderer.props) {
    Object.entries(renderer.props).forEach(([prop, value]) => {
      getCellRendererPropValue(prop, value, elementProps, dataObject);
    });
  }


  return (
    <>
      <renderer.element {...elementProps} />
      <div style={{ color: 'var(--tol-grey-light)'}}>
        <Icon
          icon={expanded ? "caret-up" : "caret-down"}
          onClick={() => {
            setExpanded(!expanded);
            setExpandedRows((prev: string[]) => {
              const id = elementProps.dataObject.id;
              return prev.includes(id)
                ? prev.filter((existingId) => existingId !== id)
                : [...prev, id];
            });
          }}
          size="1x"
        />
      </div>
    </>
  );
}