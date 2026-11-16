/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CheckTree as RSCheckTree } from "rsuite";

import { Button, BUTTONS, TolLoader } from "..";

export interface PMyFieldsTab {
  value: string[];
  onChange: (value: string[]) => void;
}

export function MyFieldsTab({ value, onChange }: PMyFieldsTab) {
  const [customFields, setCustomFields] = useState<string[] | undefined>(["one", "two", "three"]);

  const loading = customFields === undefined;

  return (
    <div className="tol-attribute-selector-my-fields-tab">
      <Button
        className="tol-attribute-selector-my-fields-tab__new-field-button"
        testid="create-custom-field-button"
        type="success"
        icon="plus"
        text="New Field"
        loading={loading}
        disabled={loading}
      />
      <div className="tol-attribute-selector-my-fields-tab__field-list">
        {loading ? (
          <TolLoader />
        ) : (
          <RSCheckTree
            className="tol-attribute-selector-my-fields-tab__field-tree"
            data={customFields.map((field) => ({
              label: field,
              value: field,
            }))}
            renderTreeNode={(node) => (
              <span className="tol-attribute-selector-my-fields-tab__field-row">
                <span className="tol-attribute-selector-my-fields-tab__field-name">
                  {node.label}
                </span>
                <span
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Button {...BUTTONS.EDIT} />
                </span>
              </span>
            )}
            value={value.filter((field) => customFields.includes(field))}
            onChange={(selectedFields) => {
              const customFieldValues = new Set(customFields);
              onChange([
                ...value.filter((field) => !customFieldValues.has(field)),
                ...selectedFields.filter(
                  (field): field is string => typeof field === "string"
                ),
              ]);
            }}
          />
        )}
      </div>
    </div>
  );
}
