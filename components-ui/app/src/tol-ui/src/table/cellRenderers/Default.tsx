/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { DATA_POINT_INDENTATION, PCellDisplay, Tag } from "../..";


/**
 * Default cell renderer that can handle various data types, including nested objects and arrays.
 * It recursively renders arrays as lists of tags and objects as key-value pairs with indentation to indicate nesting levels.
 * For primitive values, it simply converts them to strings for display.
 */
export function Default(props: PCellDisplay) {
  const { value } = props;

  const renderValue = (val: any, depth = 0): ReactNode => {
    if (Array.isArray(val)) {
      return (
        <div className="tol-default-renderer-array">
          {val.map((item, idx) => (
            <Tag key={idx}>{renderValue(item, depth + 1)}</Tag>
          ))}
          <span className="tol-default-renderer-clear" aria-hidden="true" />
        </div>
      );
    }

    if (val && typeof val === "object") {
      return (
        <div className="tol-default-renderer-object">
          {Object.entries(val).map(([k, v]) => {
            const isNestedObject =
              v && typeof v === "object" && !Array.isArray(v);

            const entryClassName = `tol-default-renderer-object-entry${
              isNestedObject ? " tol-default-renderer-object-entry--nested" : ""
            }`;

            return (
              <div
                key={k}
                className={entryClassName}
                style={{ marginLeft: depth * DATA_POINT_INDENTATION }}
              >
                <div className="tol-default-renderer-object-key">
                  <strong>{k}:</strong>
                </div>
                <div className="tol-default-renderer-object-value">
                  {renderValue(v, depth + 1)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return <span className="tol-default-renderer-leaf">{String(val)}</span>;
  };

  return <div className="tol-default-renderer">{renderValue(value)}</div>;
}