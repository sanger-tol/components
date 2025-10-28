/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  AttributeSelector,
  Drawer,
  SelectedAttributesContainer,
  generateSunburstConfig,
  IRemoteTarget
} from "../index";


export interface ISliceByDrawer extends IRemoteTarget {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  onConfigSave: (config: object) => void;
  sticky?: boolean;
  customAttributeSelection?: string[] | undefined;
  sliceBy: string[];
}

export function SliceByDrawer(props: ISliceByDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    customAttributeSelection,
    sliceBy
  } = props;
  const [attributes, setAttributes] = useState<string[]>(sliceBy);
  const [initialAttributes, setInitialAttributes] = useState<string[]>(sliceBy);

  const hasPendingChanges = (
    JSON.stringify(attributes) !== JSON.stringify(initialAttributes)
  );

  useEffect(() => {
    if (open) {
      setAttributes(sliceBy);
      setInitialAttributes(sliceBy);
    }
  }, [open]);

  const onSave = () => {
    if (hasPendingChanges) {
      const updatedConfig = generateSunburstConfig(attributes);
      onConfigSave(updatedConfig);
      setInitialAttributes(attributes);
    }
    setOpen(!open);
  };

  return (
    <Drawer
      title={title}
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      <h6 className="tol-config-drawer-column-title">
        Selected Attributes (Inner Ring at the Top):
      </h6>
      <div>
        <AttributeSelector
          {...props}
          sticky
          recommendedFilterAvailable
          renderSearchBySource
          displaySource
          placeholder="Select Attributes to Slice By..."
          attribute={attributes}
          setAttributes={setAttributes}
          disabledValues={null}
          numPopulatedFields={0}
          maxSelections={5}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          customAttributeSelection={customAttributeSelection}
        />
      </div>
      <SelectedAttributesContainer
        {...props}
        attributes={attributes}
        setAttributes={setAttributes}
      />
    </Drawer>
  );
}
