/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getFieldByName, ICellRenderer, ICellRendererInstanceData } from "../..";


export interface PCell extends ICellRendererInstanceData {
  renderer: ICellRenderer;
}

export function Cell(props: PCell) {
  const { value, dataObject, renderer } = props;

  if (!renderer || !renderer.type) return <>{value}</>;

  const elements = {
    relationship: () => <>Relationship</>,
    relationshipDetail: () => <>Relationship Detail</>,
    datetime: () => <>DateTime</>,
    boolean: () => <>Boolean</>,
    image: () => <>Image</>,
    list: () => <>List</>,
    expander: () => <>Expander</>,
    float: () => <>Float</>,
    integer: () => <>Integer</>,
    link: () => <>Link</>,
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
