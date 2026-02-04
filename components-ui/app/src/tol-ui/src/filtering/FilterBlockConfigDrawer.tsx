/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  AttributeSelector,
  Drawer,
  SelectedAttributesContainer,
  IRemoteTarget,
  deepCopy,
} from "..";


export interface PFilterBlockConfigDrawer extends IRemoteTarget {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  sticky?: boolean;
  filterBlockConfig: string[];
  customAttributeSelection?: string[];
  onConfigSave: (config: string[]) => void;
  id: string;
}

export function FilterBlockConfigDrawer(props: PFilterBlockConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    customAttributeSelection,
    filterBlockConfig,
  } = props;

  const [newFilterBlockConfig, setNewFilterBlockConfig] = useState<string[]>();
  const [attributes, setAttributes] = useState<string[]>([]);

  const hasPendingChanges = (
    JSON.stringify(newFilterBlockConfig) !== JSON.stringify(filterBlockConfig) ||
    JSON.stringify(attributes) !== JSON.stringify(newFilterBlockConfig)
  );

  useEffect(() => {
    setAttributes(filterBlockConfig || []);
    setNewFilterBlockConfig(deepCopy(filterBlockConfig));
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      if (!newFilterBlockConfig) {
        setNewFilterBlockConfig([]);
      }
      onConfigSave(attributes);
    }
  };

  const AttributeSelecting = (
    <>
      <h6 className="tol-config-drawer-column-title">Active Filters:</h6>
      <div>
        <AttributeSelector
          {...props}
          sticky
          recommendedFilterAvailable
          renderSearchBySource
          displaySource
          placeholder="Select filters to display..."
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          customAttributeSelection={customAttributeSelection}
          maxSelections={4}
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
