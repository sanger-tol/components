/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import HoverOverlay from '../general/HoverOverlay';


interface Props {
  text: string, 
  contents: string
}

function CellTooltip(props: Props) {
  const { text, contents } = props;
  return (
    <HoverOverlay
      followCursor
      contents={ contents }
    >
      <div className='tooltip-wrapper'>
        { text }
      </div>
    </HoverOverlay>
  );
}

export default CellTooltip;
