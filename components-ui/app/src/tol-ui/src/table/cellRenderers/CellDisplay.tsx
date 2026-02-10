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


export function CellDisplay(props: PCell) {
  const { value, dataObject, renderer, customCellRenderers, setExpandedRows } = props;
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

  const collectElements = () => {
    if (Array.isArray(value)) {
      // Use a set to remove duplicates
      const set_ = new Set(value);

      return Array.from(set_).map((val) => {
        // Only return elements for where a value exists

        if (val) return (
          // Return lists inside of tags
          <Tag
            {...elementProps}
            key={val}
            value={
              <renderer.element {...elementProps} value={val} />
            }
          />
        )
      });
    }
    return <renderer.element {...elementProps} />;
  }

  return (
    <>
      {collectElements()}
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
}