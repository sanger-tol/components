/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Toggle } from "rsuite";
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
  HoverOverlay,
  Icon,
  useBoard,
  PRIVILEGE,
  TABLE_CONFIG_DIFF_AUTH_VS_NO_AUTH_NOTICE_DISMISSED_KEY,
  EDIT_MODE_TABLE_CONFIG_MESSAGE,
  PERSONAL_TABLE_CONFIG_MESSAGE,
  ENTITY_DIFF_LOGGED_IN_OUT_DIFFERENCE_WARNING_MESSAGE,
  Tabs,
  IEntityMeta,
  getFlattenedMetaData,
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
  const isEditable = privilege === PRIVILEGE.BOARD.WRITABLE;
  const canManageColumnVisibility = isEditable && !!editMode;

  const [warningDismissed, setWarningDismissed] = useState(
    () =>
      localStorage.getItem(
        TABLE_CONFIG_DIFF_AUTH_VS_NO_AUTH_NOTICE_DISMISSED_KEY,
      ) === "true"
  );

  const [newFieldMeta, setNewFieldMeta] = useState<FieldMeta>();
  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);
  const [inactiveAttributes, setInactiveAttributes] = useState<string[]>(fieldMeta.order.inactive || []);
  const [limitVisibility, setLimitVisibility] = useState<boolean>(!!fieldMeta.order.limitVisibility);
  const [allAttributeKeys, setAllAttributeKeys] = useState<string[] | undefined>(undefined);
  const initialActions = props.actions?.map((btn) => btn.name as string) ?? [];
  const [actions, setActions] = useState<string[]>(initialActions);
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);

  const hasPendingChanges = (
    JSON.stringify(newFieldMeta) !== JSON.stringify(fieldMeta) ||
    JSON.stringify(attributes) !== JSON.stringify(newFieldMeta?.order.active) ||
    JSON.stringify(inactiveAttributes) !== JSON.stringify(newFieldMeta?.order.inactive || []) ||
    limitVisibility !== !!newFieldMeta?.order.limitVisibility ||
    JSON.stringify(initialActions) !== JSON.stringify(actions) ||
    defaultSortByAttribute !== sortByAttribute ||
    defaultSortByType !== sortByType
  );

  useEffect(() => {
    setAttributes(fieldMeta?.order?.active ?? []);
    setInactiveAttributes(fieldMeta?.order?.inactive ?? []);
    setLimitVisibility(!!fieldMeta?.order?.limitVisibility);
    setNewFieldMeta(deepCopy(fieldMeta));
    if (open) {
      props.dataSource.getEntityMeta().then((em: IEntityMeta) => {
        const meta = getFlattenedMetaData(em, props.objectType);
        if (meta) setAllAttributeKeys(Object.keys(meta));
      }).catch(() => {});
    }
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      const nextInactiveAttributes = limitVisibility ? inactiveAttributes : [];
      newFieldMeta!.order.active = attributes;
      newFieldMeta!.order.inactive = nextInactiveAttributes;
      newFieldMeta!.order.limitVisibility = limitVisibility;
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

  const columnTabs = (
    <Tabs defaultActiveKey="active">
      <Tabs.Tab eventKey="active" title="Active Columns">
        <div className="tol-section-spacing-top">
          <AttributeSelector
            {...props}
            sticky
            recommendedFilterAvailable
            renderSearchBySource
            displaySource
            placeholder="Select columns to display..."
            attribute={attributes}
            setAttributes={(nextActive) => {
              setAttributes(nextActive);
              setInactiveAttributes((prevInactive) =>
                prevInactive.filter((col) => !nextActive.includes(col)),
              );
            }}
            disabledValues={null}
            numPopulatedFields={0}
            populatedFieldType={"column"}
            additionalPopulatedFieldData={"."}
            customAttributeSelection={allAttributeKeys ?? customAttributeSelection}
          />
          <SelectedAttributesContainer
            {...props}
            attributes={attributes}
            setAttributes={setAttributes}
            additionalIcons={additionalIcons}
            fieldMeta={fieldMeta!}            emptyMessage="No active columns. Select columns to display..."          />
        </div>
      </Tabs.Tab>
      <Tabs.Tab eventKey="inactive" title="Inactive Columns">
        <div className="tol-section-spacing-top">
          <AttributeSelector
            {...props}
            sticky
            recommendedFilterAvailable
            renderSearchBySource
            displaySource
            placeholder="Select columns to make them visible for users..."
            attribute={inactiveAttributes}
            setAttributes={setInactiveAttributes}
            disabledValues={null}
            numPopulatedFields={0}
            populatedFieldType={"column"}
            additionalPopulatedFieldData={"."}
            customAttributeSelection={
              allAttributeKeys
                ? allAttributeKeys.filter((col) => !attributes.includes(col))
                : undefined
            }
          />
          <SelectedAttributesContainer
            {...props}
            attributes={inactiveAttributes}
            setAttributes={setInactiveAttributes}
            additionalIcons={additionalIcons}
            fieldMeta={fieldMeta!}
            emptyMessage="No inactive columns. Select columns to make them visible for users to add them to their tables."
          />
        </div>
      </Tabs.Tab>
    </Tabs>
  );

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
        <div className="tol-section-spacing">
          <Message
            type="info"
            showIcon
            bordered
            header={false}
            closable={false}
            hidePrefix
          >
            {editMode
              ? EDIT_MODE_TABLE_CONFIG_MESSAGE
              : PERSONAL_TABLE_CONFIG_MESSAGE}
          </Message>
        </div>
      )}
      {!editMode && !warningDismissed && (
        <div className="tol-section-spacing">
          <Message
            type="warning"
            showIcon
            bordered
            header={false}
            closable
            hidePrefix
            onClose={() => {
              localStorage.setItem(
                TABLE_CONFIG_DIFF_AUTH_VS_NO_AUTH_NOTICE_DISMISSED_KEY,
                "true",
              );
              setWarningDismissed(true);
            }}
          >
            {ENTITY_DIFF_LOGGED_IN_OUT_DIFFERENCE_WARNING_MESSAGE}
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
      {canManageColumnVisibility && (
        <div className="tol-config-drawer-column-title tol-section-spacing-top">
          <div className="pass-through-toggle">
            <Toggle
              onClick={() => {
                setLimitVisibility(!limitVisibility);
              }}
              checked={limitVisibility}
            />
            <span className="tol-toggle-text" onClick={(e) => e.stopPropagation()}>
              Limit column visibility?
            </span>
            <HoverOverlay
              contents="When 'Limit Column Visibility' is enabled, users can only choose columns listed under Active and Inactive. When 'Limit Column Visibility' is disabled, users can choose from all available columns."
              placement="top"
              delay={200}
            >
              <span className="tol-inline-flex-center">
                <Icon icon="circle-info" size="sm" />
              </span>
            </HoverOverlay>
          </div>
        </div>
      )}
      {canManageColumnVisibility && limitVisibility && (
                <div className="tol-small-spacing">
                <HoverOverlay
                    contents="Active Columns are shown by default. Inactive Columns are allowed to be selected but hidden by default, and users can add them later from column selection."
                    placement="top"
                    delay={200}
                >
                    <span className="tol-info-icon-group">
                    <Icon icon="circle-info" size="sm" />
                    <small>About Active/Inactive columns</small>
                    </span>
                </HoverOverlay>
                </div>
            )}
      {canManageColumnVisibility && limitVisibility ? columnTabs : (
        <>
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
          <SelectedAttributesContainer
            {...props}
            attributes={attributes}
            setAttributes={setAttributes}
            additionalIcons={additionalIcons}
            fieldMeta={fieldMeta!}            
            emptyMessage="No active columns. Select columns to display..."          />
        </>
      )}
      {actions && actionChoices && (
        <div className="tol-section-spacing-vertical">
          <h6>Actions</h6>
          {ActionDropdown}
        </div>
      )}
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
