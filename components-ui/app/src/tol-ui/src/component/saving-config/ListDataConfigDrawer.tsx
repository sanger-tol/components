/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import {
  AttributeSelector,
  Button,
  CellRendererConfigurer,
  deepEqual,
  deepCopy,
  Drawer,
  SelectedAttributesContainer,
  IRemoteTarget,
  PageSizePicker,
  Tabs,
} from "../..";
import type { IFieldMeta, IListDataConfigSave } from "../..";


/** Props for the `ListDataConfigDrawer` component. */
export interface PListDataConfigDrawer extends IRemoteTarget {
  /** Whether the drawer is open. */
  open: boolean;
  /** Setter for toggling drawer open state. */
  setOpen: (open: boolean) => void;
  /** Current field metadata for the component. */
  fieldMeta: IFieldMeta;
  /** Default sort attribute. */
  defaultSortByAttribute?: string;
  /** Default sort direction. */
  defaultSortByType?: string;
  /** Default number of records displayed per page. */
  pageSize?: number;
  /** Callback used to persist the updated field selection. */
  onConfigSave: (config: IListDataConfigSave) => void;
}

/**
 * ListDataConfigDrawer provides field selection, sorting, and renderer configuration
 * for RemoteObjectDetail and other list-style components.
 * 
 * Parameters are prefixed with draft as they represent the temporary state
 * of the configuration before it is saved.
 */
export function ListDataConfigDrawer(props: PListDataConfigDrawer) {
  const {
    open,
    setOpen,
    onConfigSave,
    fieldMeta,
    defaultSortByAttribute,
    defaultSortByType,
    pageSize = 50,
  } = props;

  const [draftFieldMeta, setDraftFieldMeta] = useState<IFieldMeta>(() => ({
    ...deepCopy(fieldMeta),
    data: deepCopy(fieldMeta.data ?? {}),
    dataWithDefaults: deepCopy(fieldMeta.dataWithDefaults ?? {}),
  }));
  const savedAttributesRef = useRef<string[]>(fieldMeta.order.active);
  const [draftAttributes, setDraftAttributes] = useState<string[]>(fieldMeta.order.active);
  const [draftSortByAttribute, setDraftSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [draftSortByType, setDraftSortByType] = useState<string | undefined>(defaultSortByType);
  const [draftPageSize, setDraftPageSize] = useState(pageSize);

  const hasPendingChanges = (
    !deepEqual(draftAttributes, savedAttributesRef.current) ||
    !deepEqual(draftFieldMeta, fieldMeta) ||
    defaultSortByAttribute !== draftSortByAttribute ||
    defaultSortByType !== draftSortByType ||
    pageSize !== draftPageSize
  );

  useEffect(() => {
    setDraftFieldMeta({
      ...deepCopy(fieldMeta),
      data: deepCopy(fieldMeta.data ?? {}),
      dataWithDefaults: deepCopy(fieldMeta.dataWithDefaults ?? {}),
    });
    setDraftAttributes(fieldMeta.order.active);
    savedAttributesRef.current = fieldMeta.order.active;
    setDraftSortByAttribute(defaultSortByAttribute);
    setDraftSortByType(defaultSortByType);
    setDraftPageSize(pageSize);
  }, [open, defaultSortByAttribute, defaultSortByType, fieldMeta, pageSize]);

  const CellRendererConfigurerWrapper = ({ attributeId }: { attributeId: string }) => (
    <CellRendererConfigurer
      {...props}
      attributeId={attributeId}
      fieldMeta={draftFieldMeta}
      setFieldMeta={setDraftFieldMeta}
    />
  );

  const additionalIcons = [CellRendererConfigurerWrapper];

  const onSave = () => {
    if (hasPendingChanges) {
      onConfigSave({
        fieldMeta: {
          ...draftFieldMeta,
          order: { ...draftFieldMeta.order, active: draftAttributes },
        },
        defaultSortByAttribute: draftSortByAttribute,
        defaultSortByType: draftSortByType,
        pageSize: draftPageSize,
      });
    }
  };

  const SortByButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {["asc", "desc"].map((direction: string) => (
        <Button
          outline
          key={direction}
          text={direction}
          type="primary"
          onClick={() => setDraftSortByType(direction)}
          active={draftSortByType === direction}
          size="lg"
          className="tol-board-chart-sort-buttons"
        />
      ))}
    </div>
  );

  const OptionsContent = (
    <>
      <h6 className="tol-mb-sm">Default Page Size:</h6>
      <PageSizePicker
        block
        data-testid="default-page-size-dropdown"
        pageSize={draftPageSize}
        setPageSize={setDraftPageSize}
      />
      <h6 className="tol-mt-md tol-mb-sm">Default Sort:</h6>
      <AttributeSelector
        {...props}
        testid="default-sort-dropdown"
        maxSelections={1}
        placeholder="Default Sort Column"
        attribute={draftSortByAttribute ? [draftSortByAttribute] : []}
        setAttributes={(a) => {
          setDraftSortByAttribute(a[0]);
          setDraftSortByType(a[0] ? "asc" : undefined);
        }}
        disabledValues={null}
        numPopulatedFields={0}
        populatedFieldType={"field"}
        additionalPopulatedFieldData={"."}
        sticky
      />
      {draftSortByAttribute && SortByButtons}
    </>
  );

  const FieldsContent = (
    <>
      <div>
        <AttributeSelector
          {...props}
          sticky
          recommendedFilterAvailable
          placeholder="Select fields to display..."
          attribute={draftAttributes}
          setAttributes={setDraftAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"field"}
          additionalPopulatedFieldData={"."}
        />
      </div>
      <SelectedAttributesContainer
        {...props}
        attributes={draftAttributes}
        setAttributes={setDraftAttributes}
        additionalIcons={additionalIcons}
        fieldMeta={draftFieldMeta}
      />
    </>
  );

  const Content = (
    <Tabs defaultActiveKey="fields">
      <Tabs.Tab eventKey="fields" title="Fields">
        <div className="tol-section-spacing-top">
          {FieldsContent}
        </div>
      </Tabs.Tab>
      <Tabs.Tab eventKey="options" title="Options">
        <div className="tol-section-spacing-top">
          {OptionsContent}
        </div>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <Drawer
      title="Configure Component"
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      {Content}
    </Drawer>
  );
}
