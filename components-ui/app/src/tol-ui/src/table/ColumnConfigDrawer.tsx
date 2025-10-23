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
  INewCellRenderersToSave,
  ICellRenderer,
  addNewCellRenderersToFieldMeta,
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
  } = props;

  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);
  const [initialAttributes, setInitialAttributes] = useState<string[]>(fieldMeta.order.active);
  const initialActions = props.actions?.map((btn) => btn.name as string) ?? [];
  const [actions, setActions] = useState<string[]>(initialActions);
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);
  const [newCellRenderers, setNewCellRenderers] = useState<INewCellRenderersToSave>({});

  const hasPendingChanges = (
    JSON.stringify(initialAttributes) !== JSON.stringify(attributes) ||
    JSON.stringify(initialActions) !== JSON.stringify(actions) ||
    Object.keys(newCellRenderers).length !== 0 ||
    defaultSortByAttribute !== sortByAttribute ||
    defaultSortByType !== sortByType
  );

  useEffect(() => {
    setAttributes(fieldMeta?.order?.active ?? []);
    setInitialAttributes(fieldMeta?.order?.active ?? []);
    setNewCellRenderers({});
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      fieldMeta.order.active = attributes;
      addNewCellRenderersToFieldMeta(newCellRenderers, fieldMeta);
      onConfigSave({
        fieldMeta: fieldMeta,
        actions: actions.length !== 0 ? actions : undefined,
        defaultSortByAttribute: sortByAttribute,
        defaultSortByType: sortByType,
      });
      setInitialAttributes(attributes);
    }
  };

  const onCellRendererModalSave = (renderer: ICellRenderer, attributeId: string) => {
    setNewCellRenderers({ ...newCellRenderers, [attributeId]: renderer });
  };

  const onDiscard = () => {
    setAttributes(initialAttributes);
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
      fieldMeta={fieldMeta}
      onSave={onCellRendererModalSave}
    />
  );

  const additionalIcons = [
    CellRendererConfigurerWrapper,
  ];

  const AttributeSelecting = (
    <>
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
      />
    </>
  );

  return (
    <Drawer
      title={title}
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      onDiscard={onDiscard}
      hasPendingChanges={hasPendingChanges}
    >
      {AttributeSelecting}
    </Drawer>
  );
}
