/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  getFieldByName,
  IDataObject,
  TCellRenderer,
  Boolean,
  Datetime,
  Expander,
  Float,
  Image,
  Integer,
  Link,
  List,
  RelationshipDetail,
  ICustomCellRenderers,
} from "../..";

export interface PCell {
  key: string,
  value?: any,
  dataObject: IDataObject,
  renderer: TCellRenderer;
  customCellRenderers?: ICustomCellRenderers;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer, customCellRenderers } = props;

  const preDefinedElements = {
    relationship: RelationshipDetail,
    relationshipDetail: RelationshipDetail,
    datetime: Datetime,
    boolean: Boolean,
    image: Image,
    list: List,
    expander: Expander,
    float: Float,
    integer: Integer,
    link: Link
  };

  if (
    // renderer type is not defined
    !renderer ||
    !renderer.type ||
    // no value and not a custom renderer as custom renderers may not require a value
    // no need to to deal with empty values with pre-defined cellRenderers
    (!value && renderer.type in preDefinedElements)
  )
    return <>{value}</>;

  const elements = { ...preDefinedElements, ...customCellRenderers };
  renderer.element = elements[renderer.type];

  const elementProps: Record<string, any> = { ...props };

  if (renderer.props) {
    Object.entries(renderer.props).forEach(([prop, value]) => {
      if (typeof value === "string" && value.includes("${")) {
        // replace placeholders with values from dataObject
        elementProps[prop] = value.replace(/\${(.*?)}/g, (_, key) =>
          getFieldByName(dataObject, key) || ""
        );
      } else {
        elementProps[prop] = value;
      }
    });
  }

  return <renderer.element {...elementProps} />;
}