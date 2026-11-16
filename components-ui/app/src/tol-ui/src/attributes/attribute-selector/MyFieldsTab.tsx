/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { CheckTree as RSCheckTree } from "rsuite";

import {
  Button,
  BUTTONS,
  CORE_CONFIG_DS,
  stopPropagation,
  TolLoader,
} from "../..";

export interface PMyFieldsTab {
  objectType: string;
  userId: string;
  value: string[];
  onChange: (value: string[]) => void;
}

export function MyFieldsTab(props: PMyFieldsTab) {
  const {
    objectType,
    userId,
    value,
    onChange,
  } = props;

  const [customFields, setCustomFields] = useState<{ id: string; name: string }[] | undefined>();

  useEffect(() => {
    CORE_CONFIG_DS.getList({ 
      objectType: "custom_field",
      filter: {
        and_: {
          "object_type": { eq: { value: objectType } },
          "user_id": { eq: { value: userId } },
        }
      },
      requestedFields: ["id", "display_name"]
    }).then(res => {
      if (!res) {
        setCustomFields([]);
      } else {
        setCustomFields(res.map(obj => ({ id: obj!.id, name: obj!.display_name })));
      }
    });
  }, []);

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
              label: field.name,
              value: field.id,
            }))}
            renderTreeNode={(node) => (
              <span className="tol-attribute-selector-my-fields-tab__field-row">
                <span className="tol-attribute-selector-my-fields-tab__field-name">
                  {node.label}
                </span>
                <span
                  onClick={stopPropagation}
                  onKeyDown={stopPropagation}
                >
                  <Button {...BUTTONS.EDIT} />
                </span>
              </span>
            )}
            value={value.filter((field) => customFields.some(({ id }) => id === field))}
            onChange={(selectedFields) => {
              const customFieldValues = new Set(customFields.map(({ id }) => id));
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
