/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  getFieldByName,
  IDataObject,
  Relationship,
  TCellRenderer,
  TsDataSource
} from "../..";
import { Boolean } from "./Boolean";
import { Datetime } from "./Datetime";
import { Expander } from "./Expander";
import { Float } from "./Float";
import { Image } from "./Image";
import { Integer } from "./Integer";
import { Link } from "./Link";
import { List } from "./List";


export interface PCell {
  key: string,
  value?: string,
  dataObject: IDataObject,
  dataSource?: TsDataSource;
  renderer: TCellRenderer;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer } = props;

  if (!renderer || !renderer.type) return <>{value}</>;

  const elements = {
    relationship: Relationship,
    relationshipDetail: Relationship,
    datetime: Datetime,
    boolean: Boolean,
    image: Image,
    list: List,
    expander: Expander,
    float: Float,
    integer: Integer,
    link: Link,
    custom: renderer.element,
  };
  renderer.element = elements[renderer.type];

  const elementProps: Record<string, any> = { ...props };
  
  if (renderer.propPointers) {
    Object.entries(renderer.propPointers).forEach(([prop, requiredField]) => {
      elementProps[prop] = getFieldByName(dataObject, requiredField);
    });
  }
  
  if (renderer.props) {
    Object.assign(elementProps, renderer.props);
  }

  return <renderer.element {...elementProps} />;
}
