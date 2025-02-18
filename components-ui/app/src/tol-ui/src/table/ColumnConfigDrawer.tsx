/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Button,
  Icon,
  AttributeSelector,
  SourceTag,
  Drawer,
  Modal,
} from "../index";
import { getSourceData } from "../general/Utils";
import { FieldMeta, initialiseFieldMeta } from "./Field";

const TRANSITION_TIME: number = 300;

export interface Props {
  baseUrl?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fieldMeta: FieldMeta;
  displaySource?: boolean;
  onConfigSave: (fieldMeta: FieldMeta) => void;
  endpoint: string;
  sticky?: boolean;
  customAttributeSelection?: string[] | undefined;
}

function ColumnConfigDrawer(props: Props) {
  const {
    baseUrl,
    open,
    setOpen,
    title,
    fieldMeta,
    endpoint,
    onConfigSave,
    customAttributeSelection,
  } = props;
  const [attributes, setAttributes] = useState<string[]>(
    fieldMeta["order"]["active"]
  );
  const [initialAttributes, setInitialAttributes] = useState<string[]>(
    fieldMeta["order"]["active"]
  );
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  const [recentlyMoved, setRecentlyMoved] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const moveAttributeUp = (index: number) => {
    if (index === 0) return;
    const newAttributes = [...attributes];
    [newAttributes[index - 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index - 1],
    ];
    setAttributes(newAttributes);
    setRecentlyMoved(index - 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const moveAttributeDown = (index: number) => {
    if (index === attributes.length - 1) return;
    const newAttributes = [...attributes];
    [newAttributes[index + 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index + 1],
    ];
    setAttributes(newAttributes);
    setRecentlyMoved(index + 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const removeAttribute = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setAttributes(attributes.filter((_, i) => i !== index));
      setDeletingIndex(null);
    }, TRANSITION_TIME);
  };

  const updateMeta = (
    id: string,
    updatedFieldMeta: FieldMeta,
    hidden: boolean
  ) => {
    const isActive = hidden ? "inactive" : "active";
    updatedFieldMeta.order[isActive].push(id);
    updatedFieldMeta.data[id] = fieldMeta.data[id];
    updatedFieldMeta.data[id].hidden = hidden;
  };

  const fieldMetaUpdatedByContents = () => {
    const updatedFieldMeta: FieldMeta = initialiseFieldMeta();

    attributes.forEach((key) => {
      updateMeta(key, updatedFieldMeta, false);
    });

    for (const key in fieldMeta.data) {
      if (!attributes.includes(key)) {
        updateMeta(key, updatedFieldMeta, true);
      }
    }

    return updatedFieldMeta;
  };

  const saveConfig = () => {
    const updatedFieldMeta = fieldMetaUpdatedByContents();
    onConfigSave(updatedFieldMeta);
    setInitialAttributes(attributes);
    setOpen(!open);
  };

  const selectedColumn = (attr: string, index: number) => {
    const source = getSourceData(fieldMeta, attr) ?? "";
    const rename = fieldMeta.data[attr]?.rename ?? attr;

    return (
      <div
        key={`${attr}-${index}`}
        className={`tol-config-drawer-selected-column ${
          recentlyMoved === index ? "highlight" : ""
        } ${deletingIndex === index ? "deleting" : ""}`}
      >
        {rename}
        <div className="tol-config-drawer-btn-array">
          {source && <SourceTag source={source} />}
          <div
            className={"tol-active-column-btn first"}
            onClick={() => moveAttributeUp(index)}
          >
            <Icon icon="arrow-up" size="lg" />
          </div>
          <div
            className={"tol-active-column-btn"}
            onClick={() => moveAttributeDown(index)}
          >
            <Icon icon="arrow-down" size="lg" />
          </div>
          <div
            className="tol-active-column-btn"
            onClick={() => removeAttribute(index)}
          >
            <Icon icon="close" size="lg" />
          </div>
        </div>
      </div>
    );
  };

  const unsavedChangesModal = () => {
    return (
      <div>
        <Modal
          open={openSaveModal}
          setOpen={setOpenSaveModal}
          size="sm"
          children={modalContent}
          closeButton={false}
          actionButton={modalButtons}
        />
      </div>
    );
  };

  const modalContent = (
    <div>
      <h3>Unsaved Changes</h3>
      <p>
        You have an unsaved configuration, are you sure you wish to close
        without saving?
      </p>
    </div>
  );

  const cancelButton = (text?: string) => {
    return (
      <Button
        text={text ?? "Cancel"}
        type="error"
        onClick={() => setOpenSaveModal(false)}
      />
    );
  };

  const discardButton = (text?: string) => {
    return (
      <div className="tol-config-drawer-modal-discard-btn">
        <Button
          text={text ?? "Discard"}
          type="warning"
          onClick={() => confirmDiscard()}
        />
      </div>
    );
  };

  const saveButton = (text?: string) => {
    return (
      <Button
        text={text ?? "Save"}
        type="success"
        onClick={() => {
          saveConfig(), setOpenSaveModal(false);
        }}
      />
    );
  };

  const modalButtons = (
    <div
      className="tol-config-drawer-modal-btns"
      style={{ justifyContent: "flex-end" }}
    >
      {cancelButton()}
      {discardButton()}
      {saveButton()}
    </div>
  );

  const drawerButtons = (
    <div
      className="tol-config-drawer-modal-btns"
      style={{ justifyContent: "space-between" }}
    >
      <div>{saveButton("Save and Close")}</div>
      <div>{discardButton("Discard and Close")}</div>
    </div>
  );

  const handleCloseDrawer = () => {
    if (JSON.stringify(initialAttributes) !== JSON.stringify(attributes)) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setAttributes(initialAttributes);
    setOpenSaveModal(false);
    setOpen(false);
  };

  const attSelector = (
    <div>
      <div>
        <AttributeSelector
          endpoint={endpoint}
          placeholder="Select columns to display..."
          baseUrl={baseUrl}
          attribute={attributes}
          setAttribute={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          recommendedFilterAvailable={true}
          renderSearchBySource={true}
          displaySource={true}
          customAttributeSelection={customAttributeSelection}
        />
      </div>
      <div>
        <h6 className="tol-config-drawer-column-title">Active Columns:</h6>
        <div className={"tol-config-drawer-column-container"}>
          {attributes.map((att, index) => (
            <div
              key={`${att}-${index}`}
              className="tol-config-drawer-column-contents"
            >
              {selectedColumn(att, index)}
            </div>
          ))}
        </div>
        {attributes.length === 0 && (
          <p>
            <i>No active columns. Select columns to display...</i>
          </p>
        )}
      </div>
      <div>
        <div className="tol-config-drawer-save-button">{drawerButtons}</div>
      </div>
    </div>
  );

  return (
    <div>
      {unsavedChangesModal()}
      <Drawer
        title={title}
        open={open}
        setOpen={setOpen}
        children={attSelector}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

export default ColumnConfigDrawer;
