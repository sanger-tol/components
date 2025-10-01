/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, stopPropagation } from "..";

export interface FieldDropdown {
  attribute: string;
}

export function FieldDropdown(props: FieldDropdown) {
  // @ts-ignore
  const { attribute } = props;

  const onClick = (e) => {
    stopPropagation(e);
  };

  // button ready for a dropdown menu - not implemented yet
  return (
    <span className="tol-field-dropdown" onClick={onClick}>
      <Icon icon="ellipsis-vertical" size="sm" />
    </span>
  );
}
