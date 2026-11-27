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
  /** The ID of the user whose custom fields are shown in the list */
  userId: string;
  /** All currently selected attribute names in the AttributeSelector */
  value: string[];
  /** Reports whether an overlay inside the selector is open. */
  onNestedOverlayChange: (open: boolean) => void;
  /** Receives the updated selection, including custom and standard fields. */
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

  const [customFields, setCustomFields] = useState<{
    id: string; displayName: string; systemName: string
  }[] | undefined>();
  const [editFieldModalOpen, setEditFieldModalOpen] = useState(false);
  const [editingCustomFieldId, setEditingCustomFieldId] = useState<number | undefined>();

  /** Fetches the current user's custom fields and updates the tab contents. */
  const fetchCustomFields = async () => {
    const response = await CORE_CONFIG_DS.getList({
      objectType: "custom_field",
      filter: {
        and_: {
          "object_type": { eq: { value: objectType } },
          "user_id": { eq: { value: userId } },
        }
      },
      requestedFields: ["id", "display_name"]
    });
    setCustomFields(response?.map(obj => ({
      id: obj!.id,
      displayName: obj!.display_name,
      systemName: `custom_${obj!.id}`
    })) ?? []);
  };

  useEffect(() => {
    void fetchCustomFields();
  }, []);

  /**
   * Updates the parent AttributeSelector with the new list of custom fields.
   * @param selectedCustomFields The custom fields currently selected
   */
  const handleSelectionChange = (selectedCustomFields: string[]) => {
    // A set of every available custom field
    const availableCustomFields = new Set(customFields?.map(({ systemName }) => systemName));

    // All other fields chosen in the attribute selector that are not custom fields
    const otherFields = value.filter((field) => !availableCustomFields.has(field));

    onChange([
      ...otherFields,
      ...selectedCustomFields,
    ]);
  };

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
              label: field.displayName,
              value: field.systemName,
            }))}
            value={value.filter(
              (field) => customFields.some(({ systemName }) => systemName === field)
            )}
            onChange={handleSelectionChange}
            renderItemRight={itemData => (
              <Button
                {...BUTTONS.EDIT}
                onClick={() => {
                  // The ListBox takes the system name in its data because that's the name
                  // to display to the user, so we need to convert this to an ID first
                  const customField = customFields.find(
                    field => field.systemName === itemData.value
                  );
                  if (customField) {
                    editCustomField(Number(customField.id));
                  }
                }}
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
        refreshCustomFieldList={fetchCustomFields}
      />
    </div>
  );
}
