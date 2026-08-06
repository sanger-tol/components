/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import {
  HoverOverlay,
  Icon,
  Markdown,
} from "..";


export interface PIconTooltip {
  contents: ReactNode;
  disableMarkdown?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function IconTooltip(props: PIconTooltip) {
  const {
    contents,
    disableMarkdown,
    icon = <Icon icon="circle-info" size="sm" />,
    className
  } = props;

  let renderedContents = contents;

  if (typeof contents === "string") {
    renderedContents =
      disableMarkdown === true ? (
        contents
      ) : (
        <Markdown contents={contents}></Markdown>
      );
  }

  return (
    <span className={`tol-icon-tooltip${className ? ` ${className}` : ""}`} onClick={(e) => e.stopPropagation()}>
      <HoverOverlay contents={renderedContents}>
        <span className="tooltip-wrapper">
          {icon}
        </span>
      </HoverOverlay>
    </span>
  );
}
