/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import HoverOverlay from '../general/HoverOverlay';


export interface Props {
  text: string, 
  contents: string
}

class CellTooltip extends React.Component<Props> {
  render() {
    const { text, contents } = this.props;
    return (
      <HoverOverlay
        contents={ contents }
      >
        <div className='tooltip-wrapper'>
          { text }
        </div>
      </HoverOverlay>
    );
  }
}

export default CellTooltip;
