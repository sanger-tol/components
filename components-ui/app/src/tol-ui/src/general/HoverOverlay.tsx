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
  const { contents, children, delay = 300, onHover, followCursor } = props;
  const placement = props.placement === undefined ? "auto" : props.placement;

  const renderTooltip = () => <Popover>{contents}</Popover>;

  if (!contents) return children

  return (
    <Whisper
      // @ts-ignore
      placement={placement}
      controlId="control-id-hover-enterable"
      trigger="hover"
      speaker={renderTooltip()}
      enterable={followCursor ? false : true}
      followCursor={followCursor ? true : false}
      onEntering={onHover !== undefined ? onHover : () => {}}
      delayOpen={delay}
    >
      {children}
    </Whisper>
  );
}
