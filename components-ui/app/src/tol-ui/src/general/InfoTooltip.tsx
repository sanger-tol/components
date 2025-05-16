/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InfoIcon } from "./CustomIcons";
import HoverOverlay from "./HoverOverlay";
import Markdown from "./Markdown";
import { ReactNode } from "react";

export interface Props {
  contents: ReactNode;
  disableMarkdown?: boolean;
}

export function InfoTooltip(props: Props) {
  const { contents, disableMarkdown } = props;

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
        <div className="tooltip-wrapper">
          <InfoIcon />
        </div>
      </HoverOverlay>
    </span>
  );
}
