/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import HoverOverlay from '../general/HoverOverlay';


interface Props {
  value: any,
  contents: any,
  followCursor?: boolean
}

function CellTooltip(props: Props) {
  const { value, contents } = props;
  return (
    <HoverOverlay
      {...props}
      contents={ contents }
    >
      <div className='tooltip-wrapper'>
        { value }
      </div>
    </HoverOverlay>
  );
}

export default CellTooltip;
