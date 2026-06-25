/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PPlaceholder } from "..";
import {
  faChartColumn,
  faChartPie,
  faMapLocationDot,
  faUpDownLeftRight,
  faTable,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader, StatusMessage } from "..";

export function PlaceholderIcon(Props: PPlaceholder) {
  const {
    bar,
    pie,
    table,
    map,
    drag,
    download,
    loader,
    message,
    messagePosition = "bottom",
    warningMessage,
    errorMessage,
  } = Props;
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
  } else if (download) {
    icon = <FontAwesomeIcon icon={faDownload} size="8x" />;
  } else if (loader) {
    icon = <Loader />;
  } else if (warningMessage !== undefined) {
    icon = <StatusMessage status="warning" message={warningMessage} bordered />;
  } else if (errorMessage !== undefined) {
    icon = <StatusMessage status="error" message={errorMessage} bordered />;
  }

  return (
    <div>
      {messagePosition === "top" && message && (
        <p className="tol-placeholder-message">{message}</p>
      )}
      {icon}
      {messagePosition === "bottom" && message && (
        <p className="tol-placeholder-message">{message}</p>
      )}
    </div>
  );
}
