/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Popover, Whisper } from 'rsuite';


function renderTooltip(contents: JSX.Element|string) {
  return (
    <Popover>
      { contents }
    </Popover>
  );
}

export interface Props {
  contents: JSX.Element|string,
  children: JSX.Element,
  placement?: string,
  delay?: number,
  onHover?: any,
  followCursor?: boolean
}

function HoverOverlay(props: Props) {
  const {contents, children, delay, onHover, followCursor} = props;
  const placement = props.placement === undefined ? 'auto' : props.placement;

  return (
    <Whisper
      // @ts-ignore
      placement={ placement }
      controlId="control-id-hover-enterable"
      trigger="hover"
      speaker={renderTooltip(contents)}
      enterable={followCursor ? false : true}
      followCursor={followCursor ? true : false}
      onEntering={onHover !== undefined ? onHover : () => {}}
      delay={delay}
    >
      {children}
    </Whisper>
  );
}

export default HoverOverlay;
