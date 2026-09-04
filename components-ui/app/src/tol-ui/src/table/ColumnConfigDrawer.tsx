/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Toggle } from "rsuite";
import {
  addDefaultsFromEntityMeta,
  addFieldMetaDefaults,
  AttributeSelector,
  Button,
  CellRendererConfigurer,
  ConfigDrawerTabs,
  deepCopy,
  Drawer,
  EDIT_MODE_TABLE_CONFIG_MESSAGE,
  ENTITY_DIFF_LOGGED_IN_OUT_DIFFERENCE_WARNING_MESSAGE,
  getFlattenedMetaData,
  HoverOverlay,
  Icon,
  Message,
  MultipleSelect,
  PERSONAL_TABLE_CONFIG_MESSAGE,
  PRIVILEGE,
  SelectedAttributesContainer,
  TABLE_CONFIG_DIFF_AUTH_VS_NO_AUTH_NOTICE_DISMISSED_KEY,
  useBoard,
} from "..";
import type {
  IFieldMeta,
  IDropdownButtonConfig,
  IEntityMeta,
  IRemoteTarget,
  ITableConfigSave,
  PButton,
} from "..";


export interface PColumnConfigDrawer extends IRemoteTarget {
  /**
   * Whether the drawer is open.
   */
  open: boolean;
  /**
   * Setter for toggling drawer open state.
   */
  setOpen: Dispatch<SetStateAction<boolean>>;
  /**
   * Drawer title.
   */
  title: string;
  /**
   * Current table field metadata.
   */
  fieldMeta: IFieldMeta;
  /**
   * Whether to display source badges.
   */
  displaySource?: boolean;
  /**
   * Whether selectors should remain sticky.
   */
  sticky?: boolean;
  /**
   * Optional list of selectable attributes.
   */
  customAttributeSelection?: string[];
  /**
   * Configured actions for this table.
   */
  actions?: IDropdownButtonConfig[];
  /**
   * Available action choices.
   */
  actionChoices?: string[];
  /**
   * Whether grouping is enabled.
   */
  groupBy?: boolean;
  /**
   * Default sort attribute.
   */
  defaultSortByAttribute?: string;
  /**
   * Default sort direction.
   */
  defaultSortByType?: string;
  /**
   * Callback used to persist configuration.
   */
  onConfigSave: (config: ITableConfigSave) => void;
  /**
   * Callback used to reset configuration.
   */
  onReset?: () => void;
  /**
   * Whether to show reset action.
   */
  showConfigReset?: boolean;
  /**
   * Loading state for action buttons.
   */
  loading?: boolean;
  /**
   * Whether board is currently in edit mode.
   */
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

  const [newFieldMeta, setNewFieldMeta] = useState<IFieldMeta>(deepCopy(fieldMeta));
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
        if (meta) {
          setAllAttributeKeys(Object.keys(meta));
        }
      }).catch(() => {});
    }
  }, [open]);

  // When a column is added, not only does the `attribute` state need to be set,
  // but it also needs to be added to `newFieldMeta`
  const handleAddColumn = (newAttributes: string[]) => {
    // Find the column that's just been added
    const newestAttribute = newAttributes.find(attribute => !attributes.includes(attribute));
    if (!newestAttribute) return;

    // Add the column to the active attributes list
    setAttributes(newAttributes);

    // Add the required entries to `newFieldMeta` for the new column
    newFieldMeta.order.active.push(newestAttribute);
    newFieldMeta.dataWithDefaults![newestAttribute] = {};
    newFieldMeta.data![newestAttribute] = {};
    
    // Populate `dataWithDefaults` for the new column
    addFieldMetaDefaults(props.objectType, newFieldMeta, props.dataSource);

    // Register the new field meta
    setNewFieldMeta({
      ...newFieldMeta
    });
  };

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
  );

  const SortByButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {["asc", "desc"].map((direction: string) => (
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
        testid="default-sort-dropdown"
        groupBy={groupBy}
        maxSelections={1}
        placeholder="Default Sort Column"
        attribute={sortByAttribute ? [sortByAttribute] : []}
        setAttributes={(a) => {
          setSortByAttribute(a[0]);
          setSortByType(a[0] ? "asc" : undefined);
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
          <div className="tol-toggle-option">
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
      {canManageColumnVisibility && limitVisibility ? (
        <ConfigDrawerTabs
          {...props}
          attributes={attributes}
          setAttributes={setAttributes}
          inactiveAttributes={inactiveAttributes}
          setInactiveAttributes={setInactiveAttributes}
          additionalIcons={additionalIcons}
          fieldMeta={fieldMeta}
          allAttributeKeys={allAttributeKeys}
          customAttributeSelection={customAttributeSelection}
        />
      ) : (
        <>
          <h6 className="tol-config-drawer-column-title">Active Columns:</h6>
          <div>
            <AttributeSelector
              {...props}
              testid="active-columns-dropdown"
              sticky
              recommendedFilterAvailable
              renderSearchBySource
              displaySource
              placeholder="Select columns to display..."
              attribute={attributes}
              setAttributes={handleAddColumn}
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
          />
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
