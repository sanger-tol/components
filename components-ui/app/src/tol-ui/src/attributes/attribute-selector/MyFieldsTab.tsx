/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";

import CustomFieldModal from "./CustomFieldModal";
import {
  Button,
  BUTTONS,
  CORE_CONFIG_DS,
  ListBox,
  stopPropagation,
  TolLoader,
} from "../..";
import type { IRemoteTarget } from "../..";

/** Props for the MyFieldsTab component */
export interface PMyFieldsTab extends IRemoteTarget {
  userId: string;
  value: string[];
  onNestedOverlayChange: (open: boolean) => void;
  onChange: (value: string[]) => void;
}

/** Displays the user's custom fields and lets them select, create, or edit fields. */
export function MyFieldsTab(props: PMyFieldsTab) {
  const {
    objectType,
    dataSource,
    userId,
    value,
    onNestedOverlayChange,
    onChange,
  } = props;

  const [customFields, setCustomFields] = useState<{ id: string; name: string }[] | undefined>();
  const [editFieldModalOpen, setEditFieldModalOpen] = useState(false);
  const [editingCustomFieldId, setEditingCustomFieldId] = useState<number | undefined>();

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

  /**
   * Opens the custom field editor modal.
   * 
   * If an ID is provided, the modal will edit the custom field with that ID.
   * Else, the modal will create a new custom field
   */
  const editCustomField = (id?: number) => {
    // Store the ID (or `undefined` to mark no ID) in a state ready to pass to the modal
    setEditingCustomFieldId(id);

    // Show the modal
    setCustomFieldModalOpen(true); 
  };

  /**
   * Opens the custom field editor modal, while letting `AttributeSelector` know
   * there's a nested overlay open so that clicking on the modal doesn't close the
   * attribute selector, and thus the modal itself!
   */
  const setCustomFieldModalOpen = (open: boolean) => {
    setEditFieldModalOpen(open);
    onNestedOverlayChange(open);
  };

  const loading = customFields === undefined;

  return (
    <div className="tol-attribute-selector-my-fields-tab">
      <span onMouseDown={stopPropagation} onClick={stopPropagation}>
        <Button
          className="tol-attribute-selector-my-fields-tab__new-field-button"
          testid="create-custom-field-button"
          type="success"
          icon="plus"
          text="New Field"
          loading={loading}
          disabled={loading}
          onClick={() => editCustomField()}
        />
      </span>
      <div className="tol-attribute-selector-my-fields-tab__field-list">
        {loading ? (
          <TolLoader />
        ) : (
          <ListBox
            data={customFields.map((field) => ({
              label: field.name,
              value: field.id,
            }))}
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
            renderItemRight={itemData => (
              <Button
                {...BUTTONS.EDIT}
                onClick={() => editCustomField(Number(itemData.value))}
              />
            )}
          />
        )}
      </div>
      <CustomFieldModal
        open={editFieldModalOpen}
        setOpen={setCustomFieldModalOpen}
        customFieldId={editingCustomFieldId}
        objectType={objectType}
        dataSource={CORE_CONFIG_DS}
        attributeDataSource={dataSource}
        userId={Number(userId)}
      />
    </div>
  );
}
