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
  onExists: any,
  disabled: boolean
}

function FilterToggle(props: Props) {
  const { negate, onNegate, exists, onExists, disabled } = props;

  const existsButton = (
    <Button
      disabled={disabled}
      active={exists}
      className="tol-filter-button exists"
      onClick={() => onExists(exists)}
    >
      <div className='icon'>∃</div>
    </Button>
  );

  const negateButton = (
    <Button
      disabled={disabled}
      active={negate}
      className="tol-filter-button negate"
      onClick={() => onNegate(negate)}
    >
      <div className='icon'>¬</div>
    </Button>
  );

  return (
    <div className='tol-filter-button-group'>
      {!disabled ? 
        <HoverOverlay
          contents="Filter by values that exist. This will exclude empty/null values."
          followCursor
        >
          {existsButton}
        </HoverOverlay>
        : existsButton
      }
      {!disabled ? 
        <HoverOverlay
          contents="Negate this filter."
          followCursor
        >
          {negateButton}
        </HoverOverlay>
        : negateButton
      }
    </div>
  );
}

export default FilterToggle;