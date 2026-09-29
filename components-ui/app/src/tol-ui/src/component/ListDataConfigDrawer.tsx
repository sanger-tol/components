/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import {
  AttributeSelector,
  deepEqual,
  Drawer,
  SelectedAttributesContainer,
  IRemoteTarget,
} from "..";
import type { IFieldMeta } from "..";


/** Props for the `ListDataConfigDrawer` component. */
export interface PListDataConfigDrawer extends IRemoteTarget {
  /** Whether the drawer is open. */
  open: boolean;
  /** Setter for toggling drawer open state. */
  setOpen: (open: boolean) => void;
  /** Drawer title. */
  title: string;
  /** Current field metadata for the component. */
  fieldMeta: IFieldMeta;
  /** Callback used to persist the updated field selection. */
  onConfigSave: (config: { fieldMeta: IFieldMeta }) => void;
}

/**
 * ListDataConfigDrawer provides field-selection controls for RemoteObjectDetail/BoardDataList,
 * mirroring ColumnConfigDrawer's basic attribute selector but without table-only concerns
 * (sorting, cell renderers, active/inactive column visibility limiting).
 */
export function ListDataConfigDrawer(props: PListDataConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    fieldMeta,
  } = props;

  const initialAttributesRef = useRef<string[]>(fieldMeta.order.active);
  const [attributes, setAttributes] = useState<string[]>(fieldMeta.order.active);

  const hasPendingChanges = !deepEqual(attributes, initialAttributesRef.current);

  useEffect(() => {
    setAttributes(fieldMeta.order.active);
    initialAttributesRef.current = fieldMeta.order.active;
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      onConfigSave({
        fieldMeta: {
          ...fieldMeta,
          order: { ...fieldMeta.order, active: attributes },
        },
      });
    }
  };

  const AttributeSelecting = (
    <>
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
    >
      {AttributeSelecting}
    </Drawer>
  );
}
