/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Images,
  getCellRendererPropValue,
  PCell
} from "../..";

export type PRowExpander<Extra = Record<string, unknown>> = {
  key: string;
} & Record<string, { props: PCell & Extra }>;

export function RowExpander(rowData: PRowExpander) {
  const key: string = Object.keys(rowData).find(k => k !== 'key')!;
  const value: any = rowData[key];
  const renderer = value.props.renderer;

  const preDefinedElements = {
    image: Images,
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

  let element = preDefinedElements[renderer.type];
  if (!element && value.props.customCellRenderers) {
    element = value.props.customCellRenderers[renderer.type];
  }
  renderer.element = element;

  const elementProps: Record<string, any> = { ...renderer.props };

  if (renderer.props) {
    Object.entries(renderer.props).forEach(([prop]) => {
      getCellRendererPropValue(prop, value.props.value, elementProps, value.props.dataObject);
    });
  }

  return (
    <>
      <renderer.element {...elementProps} />
    </>
  );
}