/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Fragment } from "react";
import { PCellDisplay, Tag } from "../..";

export function Collection(props: PCellDisplay) {
  const { value } = props;

  const renderValue = (val: any) => {
    if (Array.isArray(val)) {
      return val.map((item, idx) => (
        <Fragment key={idx}>
          <Tag>{renderValue(item)}</Tag>
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