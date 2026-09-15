/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import {
  AttributeSelector,
  RequiredAsterisk,
  Drawer,
  deepEqual,
  IRemoteTargetAndZone,
  IMapConfig
} from "..";


export interface PMapConfigDrawer extends IRemoteTargetAndZone {
  /**
   * Whether the configuration drawer is open
   */
  open: boolean;
  /**
   * Callback to open the drawer
   */
  setOpen: (open: boolean) => void;
  /**
   * Title shown at the top of the drawer
   */
  title: string;
  /**
   * The current statistics configuration values
   */
  config: IMapConfig;
  /**
   * Called when a valid configuration is saved
   */
  onConfigSave: (config: IMapConfig) => void;
}

/**
 * MapConfigDrawer provides configuration controls for map selection
 * used by BoardMap.
 */
export function MapConfigDrawer(props: PMapConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config,
  } = props;

  const [longitudeKey, setLongitudeKey] = useState<string[]>(config.longitudeKey ? [config.longitudeKey] : []);
  const [latitudeKey, setLatitudeKey] = useState<string[]>(config.latitudeKey ? [config.latitudeKey] : []);
  const [attributeKeys, setAttributeKeys] = useState<string[]>(config.attributeKeys ? [config.attributeKeys] : []);
  const initialConfigRef = useRef({
    longitudeKey: config.longitudeKey ? [config.longitudeKey] : [],
    latitudeKey: config.latitudeKey ? [config.latitudeKey] : [],
    attributeKeys: config.attributeKeys ? [config.attributeKeys] : [],
  });

  const hasPendingChanges =
    !deepEqual(
      {
        longitudeKey,
        latitudeKey,
        attributeKeys,
      },
      initialConfigRef.current
    ) &&
    longitudeKey.length > 0 &&
    latitudeKey.length > 0;

  useEffect(() => {
    if (open) {
      const initialConfig = {
        longitudeKey: config.longitudeKey ? [config.longitudeKey] : [],
        latitudeKey: config.latitudeKey ? [config.latitudeKey] : [],
        attributeKeys: config.attributeKeys ? [config.attributeKeys] : [],
      };
      initialConfigRef.current = initialConfig;
      setLongitudeKey(initialConfig.longitudeKey);
      setLatitudeKey(initialConfig.latitudeKey);
      setAttributeKeys(initialConfig.attributeKeys);
    }
  }, [open, config.longitudeKey, config.latitudeKey, config.attributeKeys]);

  const onSave = () => {
    onConfigSave({
      longitudeKey: longitudeKey[0],
      latitudeKey: latitudeKey[0],
      attributeKeys: attributeKeys.join(","),
    });
  };

  return (
    <Drawer
      title={title}
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      <h6>
        Longitude Attribute
        <RequiredAsterisk />
      </h6>
      <AttributeSelector
        {...props}
        sticky
        renderSearchBySource
        placeholder="Select Longitude Attribute..."
        attribute={longitudeKey}
        setAttributes={setLongitudeKey}
        maxSelections={1}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
        allowedTypes={["int", "str"]}
      />
      <h6>
        Latitude Attribute
        <RequiredAsterisk />
      </h6>
      <AttributeSelector
        {...props}
        sticky
        renderSearchBySource
        placeholder="Select Latitude Attribute..."
        attribute={latitudeKey}
        setAttributes={setLatitudeKey}
        maxSelections={1}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
        allowedTypes={["int", "str"]}
      />
      <h6>
        Map Marker ToolTip Attributes
      </h6>
      <AttributeSelector
        {...props}
        sticky
        renderSearchBySource
        placeholder="Select Attribute Keys..."
        attribute={attributeKeys}
        setAttributes={setAttributeKeys}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
      />
    </Drawer>
  );
}
