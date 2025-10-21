/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Popover, Whisper } from "rsuite";

export interface PHoverOverlay {
  contents: any;
  children: any;
  placement?: string;
  delay?: number;
  onHover?: any;
  followCursor?: boolean;
}

export function HoverOverlay(props: PHoverOverlay) {
  const {
    contents,
    children,
    placement = "auto",
    delay = 300,
    onHover,
    followCursor,
  } = props;

  const RenderTooltip = () => (
    <Popover>
      <span>{contents}</span>
    </Popover>
  );

  if (!contents) return children;

  return (
    <Whisper
      // @ts-ignore
      placement={placement}
      controlId="control-id-hover-enterable"
      trigger="hover"
      speaker={RenderTooltip()}
      enterable={followCursor ? false : true}
      followCursor={followCursor ? true : false}
      onEntering={onHover ? onHover : () => { }}
      delayOpen={delay}
    >
      {children}
    </Whisper>
  );
}
