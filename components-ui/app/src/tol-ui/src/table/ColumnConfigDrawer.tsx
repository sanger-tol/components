/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  Button,
  AttributeSelector,
  Drawer,
  Modal,
  SelectedAttributesContainer,
  // MultipleSelect
} from "../index";
import { FieldMeta, initialiseFieldMeta } from "./Field";
import { getActions } from "./utils";
import { IDropdownButtonConfig } from "../models";

export interface Props {
  baseUrl?: string;
  actions?: IDropdownButtonConfig[];
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fieldMeta: FieldMeta;
  displaySource?: boolean;
  onConfigSave: (
    fieldMeta: FieldMeta,
    actions?: string[],
    sortByAttribute?: string,
    sortByType?: string ) => void;
  endpoint: string;
  sticky?: boolean;
  customAttributeSelection?: string[] | undefined;
  groupBy?: boolean;
  defaultSort?: string;  
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
    groupBy,
    defaultSort
  } = props;
  const [attributes, setAttributes] = useState<string[]>(
    fieldMeta?.order?.active ?? [],
  );
  const [initialAttributes, setInitialAttributes] = useState<string[]>(
    fieldMeta?.order?.active ?? [],
  );
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  // Used to store actions options for the dropdown
  // @ts-ignore
  const [actionOptions, setActionsOptions] = useState<string[]>([]);
  // Used to store selected actions from the dropdown
  const originalActions = props.actions?.map((btn) => btn.name as string) ?? [];
  // @ts-ignore
  const [actions, setActions] = useState<string[]>(originalActions);
  const [sortByAttribute, setSortByAttribute] = useState<string[]>(() => {
    if (!defaultSort) return [];
    return defaultSort.startsWith("-")
      ? [defaultSort.slice(1)]
      : [defaultSort];
  });
  const [sortByDirection, setSortByDirection] = useState<string>(
    defaultSort?.startsWith("-") ? "desc" : "asc"
  );

  useEffect(() => {
    setAttributes(fieldMeta?.order?.active ?? []);
    setInitialAttributes(fieldMeta?.order?.active ?? []);
  }, [fieldMeta]);

  const updateMeta = (
    id: string,
    updatedFieldMeta: FieldMeta,
    hidden: boolean,
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
    if (JSON.stringify(initialAttributes) !== JSON.stringify(attributes) || originalActions !== actions) {
      const updatedFieldMeta = fieldMetaUpdatedByContents();
      onConfigSave(updatedFieldMeta, actions, sortByAttribute[0], sortByDirection);
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

  useEffect(() => {
    const formatActionOptions = async () => {
      setActionsOptions(await getActions(endpoint))
    }
    formatActionOptions();
  }, [])

  // const actionDropdown = (
  //   <MultipleSelect
  //     block={true}
  //     placeholder="Select Actions..."
  //     data={actionOptions}
  //     value={actions}
  //     setValue={setActions}
  //   />
  // )

  const sortByButtons = (
      <div className="tol-board-chart-interval-btn-container">
        {['asc', 'desc'].map((direction: string) => (
          <Button
            outline
            key={direction}
            text={direction}
            type="primary"
            onClick={() => setSortByDirection(direction)}
            active={sortByDirection === direction}
            size="lg"
            className="tol-board-chart-interval-buttons"
          />
        ))}
      </div>
    );

  const attSelector = (
    <div>
      <div>
        <AttributeSelector
          groupBy={groupBy}
          endpoint={endpoint}
          placeholder="Select columns to display..."
          baseUrl={baseUrl}
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          recommendedFilterAvailable={true}
          renderSearchBySource={true}
          displaySource={true}
          customAttributeSelection={customAttributeSelection}
          sticky={true}
        />
      </div>
      <h6>Default Sort</h6>
      <AttributeSelector
        groupBy={groupBy}
        maxSelections={1}
        endpoint={endpoint}
        placeholder="Default Sort Column"
        baseUrl={baseUrl}
        attribute={sortByAttribute}
        setAttributes={setSortByAttribute}
        disabledValues={null}
        numPopulatedFields={0}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
        renderSearchBySource={true}
        displaySource={true}
        customAttributeSelection={customAttributeSelection}
        sticky={true}
      />
      {sortByAttribute.length > 0 && (
        <>
          {sortByButtons}
        </>
      )
      }
      {/* <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <h6>Actions</h6>
        {actionDropdown}
      </div> */}
      <SelectedAttributesContainer
        baseUrl={baseUrl}
        endpoint={endpoint}
        attributes={attributes}
        setAttributes={setAttributes}
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

export default ColumnConfigDrawer;
