/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dropdown } from "rsuite";
import { Icon, stopPropagation, copyPageColumnValues } from "..";

export interface FieldDropdown {
  attribute: string;
  data: any;
}

export function FieldDropdown(props: FieldDropdown) {
  const { attribute, data } = props;

  const onClick = (e) => {
    stopPropagation(e);
  };

  return (
    <span className="tol-field-dropdown" onClick={onClick}>
      <Dropdown
        icon={<Icon icon="ellipsis-vertical" size="xs" />}
        noCaret
        placement="bottomEnd"
      >
        <Dropdown.Item
          icon={<Icon icon="share-from-square" size="sm" />}
          onClick={() => copyPageColumnValues(data, attribute)}
        >
          Copy page column values
        </Dropdown.Item>
      </Dropdown>
    </span>
  );
}
