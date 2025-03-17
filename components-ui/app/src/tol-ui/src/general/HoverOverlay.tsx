/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Popover, Whisper } from "rsuite";

export interface Props {
  contents: ReactNode;
  children: JSX.Element;
  placement?: string;
  delay?: number;
  onHover?: any;
  followCursor?: boolean;
}

function HoverOverlay(props: Props) {
  const { contents, children, delay = 300, onHover, followCursor } = props;
  const placement = props.placement === undefined ? "auto" : props.placement;

  const renderTooltip = () => <Popover>{contents}</Popover>;

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

export default HoverOverlay;
