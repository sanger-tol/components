/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Button,
  AttributeSelector,
  Drawer,
  Modal,
  SelectedAttributesContainer
} from "../index";
import { generateSunburstConfig } from "./utils";

export interface Props {
  baseUrl?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  onConfigSave: (config: object) => void;
  endpoint: string;
  sticky?: boolean;
  customAttributeSelection?: string[] | undefined;
  sliceBy: string[];
}

function SliceByDrawer(props: Props) {
  const {
    baseUrl,
    open,
    setOpen,
    title,
    endpoint,
    onConfigSave,
    customAttributeSelection,
    sliceBy
  } = props;
  const [attributes, setAttributes] = useState<string[]>(sliceBy);
  const [initialAttributes, setInitialAttributes] = useState<string[]>(sliceBy);
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);

  const saveConfig = () => {
    if (JSON.stringify(initialAttributes) !== JSON.stringify(attributes)) {
        const updatedConfig = generateSunburstConfig(attributes);
        onConfigSave(updatedConfig);
        setInitialAttributes(attributes);
    }
    setOpen(!open);
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
          placeholder="Select Attributes to Slice By..."
          baseUrl={baseUrl}
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          maxSelections={5}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          recommendedFilterAvailable={true}
          renderSearchBySource={true}
          displaySource={true}
          customAttributeSelection={customAttributeSelection}
          sticky={true}
        />
      </div>
      <SelectedAttributesContainer
        baseUrl={baseUrl}
        endpoint={endpoint}
        attributes={attributes}
        setAttributes={setAttributes}
        title="Selected Attributes (Inner Ring at the Top):"
      />
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

export default SliceByDrawer;
