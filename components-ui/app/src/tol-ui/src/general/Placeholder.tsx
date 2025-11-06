/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { PlaceholderIcon } from "..";

export interface PPlaceholder {
  bar?: boolean;
  pie?: boolean;
  table?: boolean;
  map?: boolean;
  drag?: boolean;
  download?: boolean;
  empty?: boolean;
  loader?: boolean;
  opacity?: number;
  clear?: boolean;
  squareCorners?: boolean;
  message?: string | JSX.Element;
  warningMessage?: string;
  errorMessage?: string;
  backing?: JSX.Element;
  style?: any;
  height?: any;
  width?: any;
}

export function Placeholder(props: PPlaceholder) {
  const {
    empty,
    height = "100%",
    width = "100%",
    style = {},
    backing,
    opacity,
    clear,
    squareCorners,
  } = props;

  // this temporarily fills a gap - used for on load
  if (empty) {
    return <div style={{ height: height, width: width }} />;
  }

  const Icon = <PlaceholderIcon {...props} />;

  if (opacity) style["opacity"] = opacity;
  if (squareCorners !== true) style["borderRadius"] = 6;

  // default placeholder
  if (!backing) {
    return (
      <div style={{ height: height, width: width }}>
        <div
          className={clear ? "tol-placeholder-empty" : "tol-placeholder"}
          style={style}
        >
          <div className="tol-placeholder-icons">{Icon}</div>
        </div>
      </div>
    );
  }

  // adding a faded background to the backing contents (e.g. map behind loading)
  return (
    <div className="overlay-outer">
      <div className="overlay-top" style={{ zIndex: 1002 }}>
        <div style={{ height: height, width: width }}>
          <div className="tol-placeholder-empty">
            <div className="tol-placeholder-icons">{Icon}</div>
          </div>
        </div>
      </div>
      <div className="overlay-top" style={{ zIndex: 1001 }}>
        <div style={{ height: height, width: width }}>
          <div className="tol-placeholder" style={style} />
        </div>
      </div>
      {backing}
    </div>
  );
}
