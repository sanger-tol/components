/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { DATA_POINT_INDENTATION, PCellDisplay, Tag } from "../..";


/**
 * Default display that can handle various data types, including nested objects and arrays.
 * It recursively renders arrays as lists of tags and objects as key-value pairs with indentation to indicate nesting levels.
 * For primitive values, it simply converts them to strings for display.
 */
export function DataPointDefaultDisplay(props: PCellDisplay) {
  const { value } = props;

  const renderValue = (val: any, depth = 0): ReactNode => {
    if (Array.isArray(val)) {
      return (
        <div className="tol-data-point-default-display-array">
          {val.map((item, idx) => (
            <Tag key={idx}>{renderValue(item, depth + 1)}</Tag>
          ))}
          <span className="tol-data-point-default-display-clear" aria-hidden="true" />
        </div>
      );
    }

    if (val && typeof val === "object") {
      return (
        <div className="tol-data-point-default-display-object">
          {Object.entries(val).map(([k, v]) => {
            const isNestedObject =
              v && typeof v === "object" && !Array.isArray(v);

            const entryClassName = `tol-data-point-default-display-object-entry${isNestedObject ? " tol-data-point-default-display-object-entry--nested" : ""
              }`;

            return (
              <div
                key={k}
                className={entryClassName}
                style={{ marginLeft: depth * DATA_POINT_INDENTATION }}
              >
                <div className="tol-data-point-default-display-object-key">
                  <strong>{k}:</strong>
                </div>
                <div className="tol-data-point-default-display-object-value">
                  {renderValue(v, depth + 1)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return <span className="tol-data-point-default-display-leaf">{String(val)}</span>;
  };

  return renderValue(value);
}