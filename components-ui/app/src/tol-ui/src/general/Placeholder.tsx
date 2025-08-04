/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { getPlaceholder, getPlaceholderIcon } from "./utils";

interface Props {
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
  height?: any;
  style?: any;
}

export function Placeholder(props: Props) {
  const {
    bar,
    pie,
    table,
    map,
    drag,
    download,
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
    download,
    loader,
    message,
    warningMessage,
    errorMessage
  );

  return getPlaceholder(
    height,
    style,
    icon,
    backing,
    opacity,
    clear,
    squareCorners
  );
}
