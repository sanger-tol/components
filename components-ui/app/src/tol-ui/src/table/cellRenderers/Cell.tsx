/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  getCellRendererPropValue
} from "../..";

export interface PCell {
  attribute: string,
  value?: any,
  dataObject?: TDataObjectOrNull,
  dataSource?: TsDataSource,
  renderer: TCellRenderer;
  customCellRenderers?: ICustomCellRenderers;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer, customCellRenderers } = props;

  const preDefinedElements = {
    relationship: Relationship,
    relationshipDetail: Relationship,
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
      getCellRendererPropValue(elementProps, value, dataObject, prop);
    });
  }

  return <renderer.element {...elementProps} />;
}