/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TDataObjectOrNull,
  TCellRenderer,
  Boolean,
  Collection,
  Datetime,
  Expander,
  Float,
  Image,
  Integer,
  Link,
  Relationship,
  ICustomCellRenderers,
  TsDataSource,
  getCellRendererPropValue
} from "../..";
import { Status } from "./Status";

export interface PCell {
  attribute: string,
  value?: any,
  dataObject: TDataObjectOrNull,
  dataSource?: TsDataSource,
  renderer: TCellRenderer;
  customCellRenderers?: ICustomCellRenderers;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer, customCellRenderers } = props;

  const DefaultCell = ({ value }) => <>{value ?? ""}</>;

  const preDefinedElements = {
    boolean: Boolean,
    collection: Collection,
    datetime: Datetime,
    expander: Expander,
    float: Float,
    image: Image,
    integer: Integer,
    link: Link,
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
    ((value === null || value === undefined) && (renderer.type) in preDefinedElements)
  )
    return <DefaultCell value={value} />;

  const elements = { ...preDefinedElements, ...customCellRenderers };
  renderer.element = elements[renderer.type] || DefaultCell;

  const elementProps: Record<string, any> = { ...props };

  if (renderer.props) {
    Object.entries(renderer.props).forEach(([prop, value]) => {
      getCellRendererPropValue(prop, value, elementProps, dataObject);
    });
  }

  return <renderer.element {...elementProps} />;
}