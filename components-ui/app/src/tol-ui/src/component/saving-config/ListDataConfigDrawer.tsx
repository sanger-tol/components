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
  /** Callback used to persist the updated field selection. */
  onConfigSave: (config: IListDataConfigSave) => void;
}

/**
 * ListDataConfigDrawer provides field selection, sorting, and renderer configuration
 * for RemoteObjectDetail and other list-style components.
 */
export function ListDataConfigDrawer(props: PListDataConfigDrawer) {
  const {
    open,
    setOpen,
    onConfigSave,
    fieldMeta,
    defaultSortByAttribute,
    defaultSortByType,
  } = props;

  const [draftFieldMeta, setDraftFieldMeta] = useState<IFieldMeta>(() => ({
    ...deepCopy(fieldMeta),
    data: deepCopy(fieldMeta.data ?? {}),
    dataWithDefaults: deepCopy(fieldMeta.dataWithDefaults ?? {}),
  }));
  const initialAttributesRef = useRef<string[]>(fieldMeta.order.active);
  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(defaultSortByAttribute);
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);

  const hasPendingChanges = (
    !deepEqual(attributes, initialAttributesRef.current) ||
    !deepEqual(draftFieldMeta, fieldMeta) ||
    defaultSortByAttribute !== sortByAttribute ||
    defaultSortByType !== sortByType
  );

  useEffect(() => {
    setDraftFieldMeta({
      ...deepCopy(fieldMeta),
      data: deepCopy(fieldMeta.data ?? {}),
      dataWithDefaults: deepCopy(fieldMeta.dataWithDefaults ?? {}),
    });
    setAttributes(fieldMeta.order.active);
    initialAttributesRef.current = fieldMeta.order.active;
    setSortByAttribute(defaultSortByAttribute);
    setSortByType(defaultSortByType);
  }, [open, defaultSortByAttribute, defaultSortByType, fieldMeta]);

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
          order: { ...draftFieldMeta.order, active: attributes },
        },
        defaultSortByAttribute: sortByAttribute,
        defaultSortByType: sortByType,
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
          onClick={() => setSortByType(direction)}
          active={sortByType === direction}
          size="lg"
          className="tol-board-chart-sort-buttons"
        />
      ))}
    </div>
  );

  const Content = (
    <>
      <h6>Default Sort:</h6>
      <AttributeSelector
        {...props}
        testid="default-sort-dropdown"
        maxSelections={1}
        placeholder="Default Sort Column"
        attribute={sortByAttribute ? [sortByAttribute] : []}
        setAttributes={(a) => {
          setSortByAttribute(a[0]);
          setSortByType(a[0] ? "asc" : undefined);
        }}
        disabledValues={null}
        numPopulatedFields={0}
        populatedFieldType={"field"}
        additionalPopulatedFieldData={"."}
        sticky
      />
      {sortByAttribute && SortByButtons}
      <h6 className="tol-config-drawer-column-title">Active Fields:</h6>
      <div>
        <AttributeSelector
          {...props}
          sticky
          recommendedFilterAvailable
          placeholder="Select fields to display..."
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"field"}
          additionalPopulatedFieldData={"."}
        />
      </div>
      <SelectedAttributesContainer
        {...props}
        attributes={attributes}
        setAttributes={setAttributes}
        additionalIcons={additionalIcons}
        fieldMeta={draftFieldMeta}
      />
    </>
  );

  return (
    <Drawer
      title="Configure List Component"
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      {Content}
    </Drawer>
  );
}
