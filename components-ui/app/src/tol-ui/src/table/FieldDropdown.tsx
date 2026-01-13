/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dropdown } from "rsuite";
import { Icon, stopPropagation, copyPageColumnValues, TFieldDropdownChoices } from "..";

export interface FieldDropdown {
  attribute: string;
  data: any;
  separator?: string;
  choices?: TFieldDropdownChoices;
}

export function FieldDropdown(props: FieldDropdown) {
  const {
    attribute,
    data,
    separator,
    choices
  } = props;

  const onClick = (e) => {
    stopPropagation(e);
  };

  if (choices && choices.length === 0) return;

  return (
    <span className="tol-field-dropdown" onClick={onClick}>
      <Dropdown
        icon={<Icon icon="ellipsis-vertical" size="sm" />}
        noCaret
        placement="bottomEnd"
      >
        {(!choices || choices.includes("copyValues")) && (
          <Dropdown.Item
            icon={<Icon icon="copy" size="sm" />}
            onClick={() => copyPageColumnValues(data, attribute, separator)}
          >
            Copy Values
          </Dropdown.Item>
        )}
      </Dropdown>
    </span>
  );
}