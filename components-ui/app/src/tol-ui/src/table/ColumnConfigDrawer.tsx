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
  FieldMeta,
  IRemoteTarget,
  IDropdownButtonConfig,
  MultipleSelect,
  ITableConfigSave,
  Icon,
} from "..";


interface Props extends IRemoteTarget {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fieldMeta: FieldMeta;
  displaySource?: boolean;
  sticky?: boolean;
  customAttributeSelection?: string[];
  actions?: IDropdownButtonConfig[];
  actionChoices?: string[]; // just the names of the actions
  groupBy?: boolean;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  onConfigSave: (config: ITableConfigSave) => void;
}

export function ColumnConfigDrawer(props: Props) {
  const {
    open,
    setOpen,
    title,
    fieldMeta,
    onConfigSave,
    customAttributeSelection,
    groupBy,
    defaultSortByAttribute,
    defaultSortByType,
    actionChoices,
  } = props;

  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);
  const [initialAttributes, setInitialAttributes] = useState<string[]>(fieldMeta.order.active);
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  // used to store selected actions from the dropdown
  const originalActions = props.actions?.map((btn) => btn.name as string) ?? [];
  const [actions, setActions] = useState<string[]>(originalActions);
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);

  useEffect(() => {
    setAttributes(fieldMeta?.order?.active ?? []);
    setInitialAttributes(fieldMeta?.order?.active ?? []);
  }, [fieldMeta]);

  const saveConfig = () => {
    if (JSON.stringify(initialAttributes) !== JSON.stringify(attributes) || originalActions !== actions) {
      fieldMeta.order.active = attributes;
      onConfigSave({
        fieldMeta: fieldMeta,
        actions: actions.length !== 0 ? actions : undefined,
        defaultSortByAttribute: sortByAttribute,
        defaultSortByType: sortByType,
      });
      setInitialAttributes(attributes);
    }
    setOpen(!open);
    setOpenSaveModal(false);
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
        onClick={saveConfig}
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
    if (JSON.stringify(initialAttributes) !== JSON.stringify(attributes) ||
      defaultSortByAttribute !== sortByAttribute ||
      defaultSortByType !== sortByType
    ) {
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

  const actionDropdown = (
    <MultipleSelect
      block={true}
      placeholder="Select Actions..."
      data={actionChoices || []}
      value={actions}
      setValue={setActions}
    />
  )

  const sortByButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {['asc', 'desc'].map((direction: string) => (
        <Button
          outline
          key={direction}
          text={direction}
          type="primary"
          onClick={() => setSortByType(direction)}
          active={sortByType === direction}
          size="lg"
          className="tol-board-chart-sort-buttons"
        />
      ))}
    </div>
  );

  const ConfigureCellRendererOpenIcon = (
    <div
      className={"tol-active-column-btn tol-palette-icon"}
      onClick={() => console.log("works")}
    >
      <Icon icon="palette" size="lg" />
    </div>
  );

  const additionalIcons = [
    ConfigureCellRendererOpenIcon,
  ];

  const attSelector = (
    <div>
      <h6>Default Sort:</h6>
      <AttributeSelector
        {...props}
        groupBy={groupBy}
        maxSelections={1}
        placeholder="Default Sort Column"
        attribute={sortByAttribute ? [sortByAttribute] : []}
        setAttributes={(a) => {
          setSortByAttribute(a[0])
          setSortByType(a[0] ? 'asc' : undefined)
        }}
        disabledValues={null}
        numPopulatedFields={0}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
        renderSearchBySource={true}
        displaySource={true}
        customAttributeSelection={customAttributeSelection}
        sticky={true}
      />
      {sortByAttribute && (
        <>
          {sortByButtons}
        </>
      )}
      <h6 className="tol-config-drawer-column-title">Active Columns:</h6>
      <div>
        <AttributeSelector
          {...props}
          sticky
          recommendedFilterAvailable
          renderSearchBySource
          displaySource
          placeholder="Select columns to display..."
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          customAttributeSelection={customAttributeSelection}
        />
      </div>
      {actions && actionChoices && (
        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <h6>Actions</h6>
          {actionDropdown}
        </div>
      )}
      <SelectedAttributesContainer
        {...props}
        attributes={attributes}
        setAttributes={setAttributes}
        additionalIcons={additionalIcons}
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
