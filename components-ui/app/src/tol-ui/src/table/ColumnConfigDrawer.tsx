/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  Button,
  AttributeSelector,
  Drawer,
  SelectedAttributesContainer,
  FieldMeta,
  IRemoteTarget,
  IDropdownButtonConfig,
  MultipleSelect,
  ITableConfigSave,
  CellRendererConfigurer,
  deepCopy,
  PButton,
  Message,
  useBoard,
  PRIVILEGE,
} from "..";


export interface PColumnConfigDrawer extends IRemoteTarget {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  fieldMeta: FieldMeta;
  displaySource?: boolean;
  sticky?: boolean;
  customAttributeSelection?: string[];
  actions?: IDropdownButtonConfig[];
  actionChoices?: string[];
  groupBy?: boolean;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  onConfigSave: (config: ITableConfigSave) => void;
  onReset?: () => void;
  showConfigReset?: boolean;
  loading?: boolean;
  editMode?: boolean;
}

export function ColumnConfigDrawer(props: PColumnConfigDrawer) {
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
    onReset,
    showConfigReset,
    loading,
    editMode,
  } = props;

  const { privilege } = useBoard();
  const isEditable = privilege === PRIVILEGE.BOARD.EDITABLE;

  const WARNING_KEY = "tol_table_config_session_warning_dismissed";
  const [warningDismissed, setWarningDismissed] = useState(
    () => localStorage.getItem(WARNING_KEY) === "true"
  );

  const [newFieldMeta, setNewFieldMeta] = useState<FieldMeta>();
  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);
  const initialActions = props.actions?.map((btn) => btn.name as string) ?? [];
  const [actions, setActions] = useState<string[]>(initialActions);
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);

  const hasPendingChanges = (
    JSON.stringify(newFieldMeta) !== JSON.stringify(fieldMeta) ||
    JSON.stringify(attributes) !== JSON.stringify(newFieldMeta?.order.active) ||
    JSON.stringify(initialActions) !== JSON.stringify(actions) ||
    defaultSortByAttribute !== sortByAttribute ||
    defaultSortByType !== sortByType
  );

  useEffect(() => {
    setAttributes(fieldMeta?.order?.active ?? []);
    setNewFieldMeta(deepCopy(fieldMeta));
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      newFieldMeta!.order.active = attributes;
      onConfigSave({
        fieldMeta: newFieldMeta,
        actions: actions.length !== 0 ? actions : undefined,
        defaultSortByAttribute: sortByAttribute,
        defaultSortByType: sortByType,
      });
    }
  };

  const ActionDropdown = (
    <MultipleSelect
      block={true}
      placeholder="Select Actions..."
      data={actionChoices || []}
      value={actions}
      setValue={setActions}
    />
  )

  const SortByButtons = (
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

  const CellRendererConfigurerWrapper = ({ attributeId }: { attributeId: string }) => (
    <CellRendererConfigurer
      {...props}
      attributeId={attributeId}
      fieldMeta={newFieldMeta!}
      setFieldMeta={setNewFieldMeta}
    />
  );

  const additionalIcons = [
    CellRendererConfigurerWrapper,
  ];

  const resetButton: PButton = {
    visible: !!showConfigReset,
    position: "right",
    type: "primary",
    testid: "table-config-reset-button",
    tooltip: "Reset Table Configuration to Default",
    onClick: onReset,
    icon: "arrow-rotate-left",
    outline: true,
    disabled: loading,
  };

  const AttributeSelecting = (
    <>
      {isEditable && (
        <div style={{ marginBottom: "15px" }}>
          <Message
            type="info"
            showIcon
            bordered
            header={false}
            closable={false}
            hidePrefix
          >
            {editMode
              ? "Please be aware that you are editing the table for all viewers of the board."
              : "Please be aware that you are editing a version of this table for your user. If you want to edit the table for all board viewers please switch to edit mode."}
          </Message>
        </div>
      )}
      {!editMode && !warningDismissed && (
        <div style={{ marginBottom: "15px" }}>
          <Message
            type="warning"
            showIcon
            bordered
            header={false}
            closable
            hidePrefix
            onClose={() => {
              localStorage.setItem(WARNING_KEY, "true");
              setWarningDismissed(true);
            }}
          >
            {"Table configuration is saved separately for logged-in and logged-out sessions. Changes made in one will not carry over to the other."}
          </Message>
        </div>
      )}
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
      {sortByAttribute && SortByButtons}
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
          {ActionDropdown}
        </div>
      )}
      <SelectedAttributesContainer
        {...props}
        attributes={attributes}
        setAttributes={setAttributes}
        additionalIcons={additionalIcons}
        fieldMeta={fieldMeta!}
      />
    </>
  );

  return (
    <Drawer
      title={title}
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
      onSaveTestId={"save-table-button"}
      actionButtons={[resetButton]}
    >
      {AttributeSelecting}
    </Drawer>
  );
}
