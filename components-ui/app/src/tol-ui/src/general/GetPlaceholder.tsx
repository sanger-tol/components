/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PPlaceholder } from "..";

export interface PGetPlaceholder extends PPlaceholder {
  icon: JSX.Element;
}

export function GetPlaceholder(Props: PGetPlaceholder) {
  const { height, style = {}, icon, backing, opacity, clear, squareCorners } = Props;
  if (opacity) style["opacity"] = opacity;
  if (squareCorners !== true) style["borderRadius"] = 6;

  // default placeholder
  if (backing === undefined) {
    return (
      <div style={{ height: height }}>
        <div
          className={clear ? "tol-placeholder-empty" : "tol-placeholder"}
          style={style}
        >
          <div className="tol-placeholder-icons">{icon}</div>
        </div>
      </div>
    );
  }

  // adding a faded background to the backing contents (e.g. map behind loading)
  return (
    <div className="overlay-outer">
      <div className="overlay-top" style={{ zIndex: 1002 }}>
        <div style={{ height: height }}>
          <div className="tol-placeholder-empty">
            <div className="tol-placeholder-icons">{icon}</div>
          </div>
        </div>
      </div>
      <div className="overlay-top" style={{ zIndex: 1001 }}>
        <div style={{ height: height }}>
          <div className="tol-placeholder" style={style} />
        </div>
      </div>
      {backing}
    </div>
  );
}
