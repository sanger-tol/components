/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { GetPlaceholder, GetPlaceholderIcon } from "..";

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
  height?: any;
  style?: any;
}

export function Placeholder(props: PPlaceholder) {
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

  const icon = <GetPlaceholderIcon
    bar={bar}
    pie={pie}
    table={table}
    map={map}
    drag={drag}
    download={download}
    loader={loader}
    message={message}
    warningMessage={warningMessage}
    errorMessage={errorMessage}
  />;

  return <GetPlaceholder height={height} style={style} icon={icon} backing={backing} opacity={opacity} clear={clear} squareCorners={squareCorners}/>
}
