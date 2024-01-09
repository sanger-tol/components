/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { Popover, Whisper } from 'rsuite';


function renderTooltip(contents: JSX.Element|string) {
  return(
    <Popover>
      { contents }
    </Popover>
  );
}

export interface Props {
  contents: JSX.Element|string,
  placement?: string,
  children: JSX.Element
}

class HoverOverlay extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    let placement = 'auto';
    if (this.props.placement !== undefined) {
      placement = this.props.placement;
    }
    return (
      <Whisper
        // @ts-ignore
        placement={ placement }
        controlId="control-id-hover-enterable"
        trigger="hover"
        speaker={ renderTooltip(this.props.contents) }
        enterable
      >
        { this.props.children }
      </Whisper>
    );
  }
}

export default HoverOverlay;
