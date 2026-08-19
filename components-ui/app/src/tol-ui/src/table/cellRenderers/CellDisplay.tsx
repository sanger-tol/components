/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import {
  Boolean,
  Datetime,
  Float,
  ImageCell,
  Integer,
  Priority,
  Link,
  LinkGroups,
  LongText,
  getCellRendererPropValue,
  TrafficLightStatus,
  DataPointDefaultDisplay,
  Tag,
  ErrorBoundary,
  Card,
} from "../..";
import type { PDataPoints, PDataPoint } from "../..";

export interface PCellDisplay extends PDataPoint {
  /**
   * The main value to be displayed in the cell.
   */
  value: any;
}

const preDefinedElements = {
  boolean: Boolean,
  card: Card,
  datetime: Datetime,
  float: Float,
  image: ImageCell,
  integer: Integer,
  priority: Priority,
  link: Link,
  linkGroups: LinkGroups,
  longText: LongText,
  trafficLightStatus: TrafficLightStatus,
};

/**
 * Component to display the contents of a cell based on the provided renderer configuration. Handles both pre-defined renderers and custom renderers.
 * If no renderer is provided, it will default to displaying the value as a string.
 */
export function CellDisplay(props: PCellDisplay) {
  const {
    field,
    value,
    dataObject,
    parentDataObject,
    renderer,
    customCellRenderers,
    isMany = false,
  } = props;

  // Initialise the Display variable which will hold the final renderer element to be returned
  let Display: ReactNode;

  if (
    // Renderer type is not defined
    !renderer ||
    !renderer.type ||
    renderer.type === "none"
  ) {
    Display = <DataPointDefaultDisplay {...props} value={value} />;
  } else {
    // Determine the appropriate renderer element
    const elements = { ...preDefinedElements, ...customCellRenderers };
    const ResolvedElement = elements[renderer.type];

    if (!ResolvedElement) {
      // Renderer type was specified but no matching component was found — fall back to default
      console.warn(
        `CellDisplay: Unknown renderer type "${renderer.type}" for field "${field}". Falling back to default display.`,
      );
      Display = <DataPointDefaultDisplay {...props} value={value} />;
    } else {
      // Get the props for the renderer element
      const elementProps: PDataPoints & Record<string, any> = { ...props };

      if (renderer.props) {
        Object.entries(renderer.props).forEach(([prop, propValue]) => {
          getCellRendererPropValue(
            field,
            value,
            prop,
            propValue,
            elementProps,
            dataObject,
            parentDataObject,
          );
        });
      }

      Display = <ResolvedElement {...elementProps} />;
    }
  }

  if (value === null || value === undefined) {
    Display = <span className="tol-display-empty">None</span>;
  }

  /**
   * Wrap the Display in an error boundary to catch any errors
   * thrown by custom renderers and prevent the entire table from breaking
   */
  Display = <ErrorBoundary>{Display}</ErrorBoundary>;

  return isMany ? <Tag>{Display}</Tag> : Display;
}
