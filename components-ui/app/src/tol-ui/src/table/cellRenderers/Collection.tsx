/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Fragment } from "react";
import { PCell, ListItem } from "..";


export function Collection(props: PCell) {
  const { value } = props;

  const renderValue = (val: any) => {
    if (Array.isArray(val)) {
      return val.map((item, idx) => (
        <Fragment key={idx}>
          <ListItem value={renderValue(item)} />
        </Fragment>
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