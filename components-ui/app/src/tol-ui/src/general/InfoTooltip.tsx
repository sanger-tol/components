/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { InfoIcon } from './Icons';
import HoverOverlay from './HoverOverlay';


export interface Props {
  contents: string
}

class InfoTooltip extends React.Component<Props> {
  render() {
    return (
      <HoverOverlay
        contents={ this.props.contents }
      >
        <div className='tooltip-wrapper'>
          <InfoIcon />
        </div>
      </HoverOverlay>
    );
  }
}

export default InfoTooltip;
