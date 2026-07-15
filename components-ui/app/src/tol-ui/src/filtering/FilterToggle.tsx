/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "react-bootstrap";
import { HoverOverlay, Icon } from "..";


interface Props {
  negate: boolean;
  onNegate: any;
  exists: boolean;
  onExists: any;
  disabled?: boolean;
  inList?: boolean;
  onInList?: any;
  showInListButton?: boolean;
}

export function FilterToggle(props: Props) {
  const { negate, onNegate, exists, onExists, disabled = false, inList = false, onInList, showInListButton = false } = props;

  const existsButton = (
    <Button
      disabled={disabled}
      active={exists}
      className="tol-filter-button exists"
      onClick={() => onExists(exists)}
    >
      <div className="icon">∃</div>
    </Button>
  );

  const negateButton = (
    <Button
      disabled={disabled}
      active={negate}
      className="tol-filter-button negate"
      onClick={() => onNegate(negate)}
    >
      <div className="icon">¬</div>
    </Button>
  );

  const inListButton = (
    <Button
      disabled={disabled}
      active={inList}
      className="tol-filter-button in-list"
      onClick={() => onInList && onInList(inList)}
    >
      <Icon icon="list" size="xs" className="icon" />
    </Button>
  );

  return (
    <div className="tol-filter-button-group">
      {!disabled ? (
        <HoverOverlay
          contents="Filter by values that exist. This will exclude empty/null values."
          followCursor
        >
          {existsButton}
        </HoverOverlay>
      ) : (
        existsButton
      )}
      {!disabled ? (
        <HoverOverlay contents="Negate this filter." followCursor>
          {negateButton}
        </HoverOverlay>
      ) : (
        negateButton
      )}
      {showInListButton && !disabled ? (
        <HoverOverlay
          contents="Filter by a list of values."
          followCursor
        >
          {inListButton}
        </HoverOverlay>
      ) : (
        showInListButton && inListButton
      )}
    </div>
  );
}
