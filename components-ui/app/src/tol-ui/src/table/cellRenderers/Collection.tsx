/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell } from "../..";


export function Collection(props: PCell) {
  const { value } = props;

  const renderValue = (val: any) => {
    if (Array.isArray(val)) {
      return val.map((item, idx) => (
        <div className="tol-collection-list-item" key={idx}>
          {renderValue(item)}
        </div>
      ));
    }
    if (val && typeof val === "object") {
      return Object.entries(val).map(([k, v]) => (
        <div className="tol-collection-object-entry" key={k}>
          <span className="tol-collection-object-key"><strong>{k}:</strong></span>{" "}
          {renderValue(v)}
        </div>
      ));
    }
    return <span className="tol-collection-leaf">{String(val)}</span>;
  };

  return (
    <div className="tol-collection">
      {renderValue(value)}
    </div>
  );
}