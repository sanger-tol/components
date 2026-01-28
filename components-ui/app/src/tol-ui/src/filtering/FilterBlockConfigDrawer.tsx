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
  PFilterBlock,
} from "..";


export interface PFilterBlockConfigDrawer extends IRemoteTarget {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  sticky?: boolean;
  filterBlockConfig: PFilterBlock;
  customAttributeSelection?: string[];
  onConfigSave: (config: PFilterBlock) => void;
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
    id
  } = props;

  const [newFilterBlockConfig, setNewFilterBlockConfig] = useState<PFilterBlock>();
  const [attributes, setAttributes] = useState<string[]>([]);
  const [attributeMeta, setAttributeMeta] = useState<any>(null);

  const hasPendingChanges = (
    JSON.stringify(newFilterBlockConfig) !== JSON.stringify(filterBlockConfig) ||
    JSON.stringify(attributes) !== JSON.stringify(newFilterBlockConfig?.filters?.order)
  );

  useEffect(() => {
    setAttributes(filterBlockConfig.filters?.order || []);
    setNewFilterBlockConfig(deepCopy(filterBlockConfig));
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      if (!newFilterBlockConfig!.filters) {
        newFilterBlockConfig!.filters = { order: [], attributes: {} };
      }
      newFilterBlockConfig!.filters.order = attributes;
      newFilterBlockConfig!.filters.attributes = attributes.reduce((acc, attribute) => {
        acc[attribute] = {
          componentId: id,
          attribute: attribute,
          rename: attributeMeta[attribute]?.display_name || attribute,
          type: attributeMeta[attribute]?.python_type || "str",
        };
        return acc;
      }, {} as { [attributeName: string]: any });
      onConfigSave(newFilterBlockConfig!);
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
          setAttributeMeta={setAttributeMeta}
          disabledValues={null}
          numPopulatedFields={0}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          customAttributeSelection={customAttributeSelection}
          maxSelections={5}
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
