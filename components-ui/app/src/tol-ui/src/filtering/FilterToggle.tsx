/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { HoverOverlay } from '../index';
import { Button } from 'react-bootstrap';


interface Props {
  negate: boolean,
  onNegate: any,
  exists: boolean,
  onExists: any
}

function FilterToggle(props: Props) {
  const { negate, onNegate, exists, onExists } = props;

  const existsButton = (
    <Button
      active={exists}
      className="tol-filter-button exists"
      onClick={() => onExists(exists)}
    >
      <div className='icon'>∃</div>
    </Button>
  );

  const negateButton = (
    <Button
      active={negate}
      className="tol-filter-button negate"
      onClick={() => onNegate(negate)}
    >
      <div className='icon'>¬</div>
    </Button>
  );

  return (
    <div className='tol-filter-button-group'>
      <HoverOverlay
        contents="Filter by values that exist. This will exclude empty/null values."
        followCursor
      >
        {existsButton}
      </HoverOverlay>
      <HoverOverlay
        contents="Negate this filter."
        followCursor
      >
        {negateButton}
      </HoverOverlay>
    </div>
  );
}

export default FilterToggle;