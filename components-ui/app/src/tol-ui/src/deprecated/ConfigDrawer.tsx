/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { IColumnConfigDrawer } from "../interfaces/table";
import {
  Button,
  Icon,
  AttributeSelector,
  SourceTag,
  Drawer,
  Modal,
} from "../index";
import { normaliseCaps, getSourceData } from "../general/Utils";
import { FieldMeta, initialiseFieldMeta } from "./Field";

const TRANSITION_TIME: number = 300;

function ConfigDrawer(props: IColumnConfigDrawer) {
  const { baseUrl, open, setOpen, title, fieldMeta, endpoint, onConfigSave } =
    props;
  const [attribute, setAttribute] = useState<string[]>(
    fieldMeta["order"]["active"]
  );
  const [initialAttributes, _] = useState<string[]>(
    fieldMeta["order"]["active"]
  );
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  const [recentlyMoved, setRecentlyMoved] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const moveAttributeUp = (index: number) => {
    if (index === 0) return;
    const newAttributes = [...attribute];
    [newAttributes[index - 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index - 1],
    ];
    setAttribute(newAttributes);
    setRecentlyMoved(index - 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const moveAttributeDown = (index: number) => {
    if (index === attribute.length - 1) return;
    const newAttributes = [...attribute];
    [newAttributes[index + 1], newAttributes[index]] = [
      newAttributes[index],
      newAttributes[index + 1],
    ];
    setAttribute(newAttributes);
    setRecentlyMoved(index + 1);
    setTimeout(() => setRecentlyMoved(null), TRANSITION_TIME);
  };

  const removeAttribute = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setAttribute(attribute.filter((_, i) => i !== index));
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

    attribute.forEach((key) => {
      updateMeta(key, updatedFieldMeta, false);
    });

    for (const key in fieldMeta.data) {
      if (!attribute.includes(key)) {
        updateMeta(key, updatedFieldMeta, true);
      }
    }

    return updatedFieldMeta;
  };

  const saveConfig = () => {
    const updatedFieldMeta = fieldMetaUpdatedByContents();
    onConfigSave(updatedFieldMeta);
    setOpen(!open);
  };

  const selectedColumn = (att: string, index: number) => {
    const source = getSourceData(fieldMeta, att) ?? "";
    return (
      <div
        key={`${att}-${index}`}
        className={`tol-config-drawer-selected-column ${
          recentlyMoved === index ? "highlight" : ""
        } ${deletingIndex === index ? "deleting" : ""}`}
      >
        {normaliseCaps(att)}
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
      <Button
        text={text ?? "Discard"}
        type="warning"
        onClick={() => confirmDiscard()}
      />
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
    if (initialAttributes.length !== attribute.length) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setAttribute(initialAttributes);
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
          attribute={attribute}
          setAttribute={setAttribute}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          recommendedFilterAvailable={true}
          renderSearchBySource={true}
          displaySource={false}
        />
      </div>
      <div>
        <h6 className="tol-config-drawer-column-title">Active Columns:</h6>
        <div className={"tol-config-drawer-column-container"}>
          {attribute.map((att, index) => (
            <div
              key={`${att}-${index}`}
              className="tol-config-drawer-column-contents"
            >
              {selectedColumn(att, index)}
            </div>
          ))}
        </div>
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

export default ConfigDrawer;
