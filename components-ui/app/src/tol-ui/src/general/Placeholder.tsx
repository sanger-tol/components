/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faChartPie,
  faMapLocationDot,
  faUpDownLeftRight,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import { Loader, StatusMessage } from "../index";

function getPlaceholderIcon(
  bar?: boolean,
  pie?: boolean,
  table?: boolean,
  map?: boolean,
  drag?: boolean,
  loader?: boolean,
  message?: string | JSX.Element,
  warningMessage?: string,
  errorMessage?: string,
) {
  let icon: JSX.Element | null = null;

  if (bar) {
    icon = <FontAwesomeIcon icon={faChartColumn} size="8x" />;
  } else if (pie) {
    icon = <FontAwesomeIcon icon={faChartPie} size="8x" />;
  } else if (table) {
    icon = <FontAwesomeIcon icon={faTable} size="8x" />;
  } else if (map) {
    icon = <FontAwesomeIcon icon={faMapLocationDot} size="8x" />;
  } else if (drag) {
    icon = <FontAwesomeIcon icon={faUpDownLeftRight} size="6x" />;
  } else if (loader) {
    icon = <Loader />;
  } else if (warningMessage !== undefined) {
    icon = <StatusMessage status="warning" message={warningMessage} bordered />;
  } else if (errorMessage !== undefined) {
    icon = <StatusMessage status="error" message={errorMessage} bordered />;
  }

  return (
    <div>
      {icon}
      {message && <p className="tol-placeholder-message">{message}</p>}
    </div>
  );
}

function getPlaceholder(
  height: any,
  style: any = {},
  icon: JSX.Element,
  backing?: JSX.Element,
  opacity?: number,
  clear?: boolean,
  squareCorners?: boolean,
) {
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

interface Props {
  bar?: boolean;
  pie?: boolean;
  table?: boolean;
  map?: boolean;
  drag?: boolean;
  empty?: boolean;
  loader?: boolean;
  opacity?: number;
  clear?: boolean;
  squareCorners?: boolean;
  message?: string | JSX.Element;
  warningMessage?: string;
  errorMessage?: string;
  backing?: JSX.Element;
  height?: any;
  style?: any;
}

function Placeholder(props: Props) {
  const {
    bar,
    pie,
    table,
    map,
    drag,
    empty,
    loader,
    opacity,
    clear,
    squareCorners,
    message,
    warningMessage,
    errorMessage,
    backing,
    style,
  } = props;
  const height = props.height !== undefined ? props.height : "100%";

  // this temporarily fills a gap - used for on load
  if (empty) {
    return <div style={{ height: height }} />;
  }

  const icon = getPlaceholderIcon(
    bar,
    pie,
    table,
    map,
    drag,
    loader,
    message,
    warningMessage,
    errorMessage,
  );

  return getPlaceholder(
    height,
    style,
    icon,
    backing,
    opacity,
    clear,
    squareCorners,
  );
}

export default Placeholder;
