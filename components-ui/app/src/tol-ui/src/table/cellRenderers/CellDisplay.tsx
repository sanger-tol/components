/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Boolean,
  Datetime,
  Float,
  Image,
  Integer,
  Link,
  LongText,
  Relationship,
  getCellRendererPropValue,
  Icon,
  TrafficLightStatus,
  PCell,
  Collection,
  Tag
} from "../..";


export interface PCellDisplay extends PCell {
  /**
   * Whether to wrap the CellDisplay in a Tag component.
   */
  tag?: boolean;
}

/**
 * Component to display the contents of a cell based on the provided renderer configuration. Handles both pre-defined renderers and custom renderers.
 * If no renderer is provided, it will default to displaying the value as a string.
 */
export function CellDisplay(props: PCellDisplay) {
  const { value, dataObject, renderer, customCellRenderers, setExpandedRows, tag } = props;
  const [expanded, setExpanded] = useState(false);

  const DefaultCell = ({ value }) => <>{value ?? ""}</>;

  const preDefinedElements = {
    boolean: Boolean,
    collection: Collection,
    datetime: Datetime,
    float: Float,
    image: Image,
    integer: Integer,
    link: Link,
    longText: LongText,
    relationship: Relationship,
    trafficLightStatus: TrafficLightStatus,
  };

  if (
    // Renderer type is not defined
    !renderer ||
    !renderer.type ||
    renderer.type === "none" ||
    // No value and not a custom renderer as custom renderers may not require a value
    // No need to to deal with empty values with pre-defined cellRenderers
    ((value === null || value === undefined) && (renderer.type) in preDefinedElements)
  )
    return <DefaultCell value={value} />;

  const elements = { ...preDefinedElements, ...customCellRenderers };
  renderer.element = elements[renderer.type] || DefaultCell;

  const elementProps: PCell & Record<string, any> = { ...props };

  if (renderer.props) {
    Object.entries(renderer.props).forEach(([prop, value]) => {
      getCellRendererPropValue(prop, value, elementProps, dataObject);
    });
  }

  const Contents = (
    <>
      <renderer.element {...elementProps} />
      {Array.isArray(value) && value.length > 1 && renderer.type === "image" &&
        <Icon
          icon={expanded ? "caret-up" : "caret-down"}
          onClick={() => {
            setExpanded(!expanded);
            setExpandedRows((prev: string[]) => {
              const id = elementProps.dataObject!.id;
              return prev.includes(id)
                ? prev.filter((existingId) => existingId !== id)
                : [...prev, id];
            });
          }}
          size="1x"
          className={"tol-table-image-cell-arrow"}
        />
      }
    </>
  );

  return tag ? <Tag>{Contents}</Tag> : Contents;
}