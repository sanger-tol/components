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
}

export function IconTooltip(props: PIconTooltip) {
  const { contents, disableMarkdown, icon } = props;

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
    <span onClick={(e) => e.stopPropagation()}>
      <HoverOverlay contents={renderedContents}>
        <span className="tooltip-wrapper">
          {icon || <Icon icon="circle-info" size="sm"/>}
        </span>
      </HoverOverlay>
    </span>
  );
}
