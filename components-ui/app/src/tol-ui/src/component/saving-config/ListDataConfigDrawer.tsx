/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ComponentType, useEffect, useRef, useState } from "react";
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
import type { IFieldMeta, TListDataConfigSave, TAdditionalOptionsContent } from "../..";

/** Props for the `ListDataConfigDrawer`, optionally typed with component-specific options. */
export type PListDataConfigDrawer<TAdditionalOptions> = IRemoteTarget & TListDataConfigSave<TAdditionalOptions> & {
  /** Whether the drawer is open. */
  open: boolean;
  /** Setter for toggling drawer open state. */
  setOpen: (open: boolean) => void;
  /** Initial values for component-specific configuration options. */
  additionalOptions?: TAdditionalOptions;
  /** Callback used to persist the updated field selection. */
  onConfigSave: (config: TListDataConfigSave<TAdditionalOptions>) => void;
  /** Additional options to render within the drawer. */
  AdditionalOptionsContent?: ComponentType<TAdditionalOptionsContent<TAdditionalOptions>>;
};

/**
 * ListDataConfigDrawer provides field selection, sorting, and renderer configuration
 * for RemoteObjectDetail and other list-style components.
 * 
 * Parameters are prefixed with draft as they represent the temporary state
 * of the configuration before it is saved.
 */
export function ListDataConfigDrawer<TAdditionalOptions>(props: PListDataConfigDrawer<TAdditionalOptions>) {
  const {
    open,
    setOpen,
    onConfigSave,
    fieldMeta,
    defaultSortByAttribute,
    defaultSortByType,
    defaultPageSize,
    additionalOptions,
    AdditionalOptionsContent,
  } = props;

  const [draftFieldMeta, setDraftFieldMeta] = useState<IFieldMeta>(() => ({
    ...deepCopy(fieldMeta),
    data: deepCopy(fieldMeta?.data ?? {}),
    dataWithDefaults: deepCopy(fieldMeta?.dataWithDefaults ?? {}),
  }));
  const savedAttributesRef = useRef<string[]>(fieldMeta?.order?.active ?? []);
  const [draftAttributes, setDraftAttributes] = useState<string[]>(fieldMeta?.order?.active ?? []);
  const [draftSortByAttribute, setDraftSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [draftSortByType, setDraftSortByType] = useState<string | undefined>(defaultSortByType);
  const [draftPageSize, setDraftPageSize] = useState<number | undefined>(defaultPageSize);
  const [draftAdditionalOptions, setDraftAdditionalOptions] = useState<TAdditionalOptions>(
    () => deepCopy(additionalOptions ?? {}) as TAdditionalOptions,
  );

  const hasPendingChanges = (
    !deepEqual(draftAttributes, savedAttributesRef.current) ||
    !deepEqual(draftFieldMeta, fieldMeta) ||
    defaultSortByAttribute !== draftSortByAttribute ||
    defaultSortByType !== draftSortByType ||
    defaultPageSize !== draftPageSize ||
    !deepEqual(draftAdditionalOptions, additionalOptions ?? {})
  );

  useEffect(() => {
    setDraftFieldMeta({
      ...deepCopy(fieldMeta),
      data: deepCopy(fieldMeta?.data ?? {}),
      dataWithDefaults: deepCopy(fieldMeta?.dataWithDefaults ?? {}),
    });
    setDraftAttributes(fieldMeta?.order?.active ?? []);
    savedAttributesRef.current = fieldMeta?.order?.active ?? [];
    setDraftSortByAttribute(defaultSortByAttribute);
    setDraftSortByType(defaultSortByType);
    setDraftPageSize(defaultPageSize);
    setDraftAdditionalOptions(deepCopy(additionalOptions ?? {}) as TAdditionalOptions);
  }, [open, defaultSortByAttribute, defaultSortByType, fieldMeta, defaultPageSize, additionalOptions]);

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
        defaultPageSize: draftPageSize,
        ...draftAdditionalOptions,
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
      {AdditionalOptionsContent && (
        <AdditionalOptionsContent
          {...props}
          additionalOptions={draftAdditionalOptions}
          setAdditionalOptions={setDraftAdditionalOptions}
        />
      )}
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
        <section className="tol-section-spacing-top">
          {FieldsContent}
        </section>
      </Tabs.Tab>
      <Tabs.Tab eventKey="options" title="Options">
        <section className="tol-section-spacing-top">
          {OptionsContent}
        </section>
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
