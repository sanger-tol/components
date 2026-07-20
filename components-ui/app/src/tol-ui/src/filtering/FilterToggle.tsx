/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "react-bootstrap";
import { HoverOverlay, Icon } from "..";


export interface PFilterToggle {
  negate: boolean;
  onNegate: any;
  exists: boolean;
  onExists: any;
  disabled?: boolean;
  inList?: boolean;
  onInList?: any;
  showInListButton?: boolean;
}

export function FilterToggle(props: PFilterToggle) {
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
          followCursor
          contents="Filter by values that exist. This will exclude empty/null values."
        >
          {existsButton}
        </HoverOverlay>
      ) : (
        existsButton
      )}
      {!disabled ? (
        <HoverOverlay
          followCursor
          contents={
            negate
              ? "Remove this filter's negation"
              : "Negate this filter"
          }
        >
          {negateButton}
        </HoverOverlay>
      ) : (
        negateButton
      )}
      {showInListButton && !disabled ? (
        <HoverOverlay
          followCursor
          contents="Filter by a list of values."
        >
          {inListButton}
        </HoverOverlay>
      ) : (
        showInListButton && inListButton
      )}
    </div>
  );
}
