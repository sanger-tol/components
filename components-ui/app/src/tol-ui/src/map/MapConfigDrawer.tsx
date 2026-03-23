/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  AttributeSelector,
  RequiredAsterisk,
  Drawer,
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

  const longChanged = longitudeKey[0] !== config.longitudeKey;
  const latChanged = latitudeKey[0] !== config.latitudeKey;
  const hasPendingChanges = (longChanged || latChanged) && longitudeKey.length > 0 && latitudeKey.length > 0;

  useEffect(() => {
    if (open) {
      setLongitudeKey(config.longitudeKey ? [config.longitudeKey] : []);
      setLatitudeKey(config.latitudeKey ? [config.latitudeKey] : []);
    }
  }, [open, config.longitudeKey, config.latitudeKey]);

  const onSave = () => {
    onConfigSave({
      longitudeKey: longitudeKey[0],
      latitudeKey: latitudeKey[0],
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
        displaySource
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
        displaySource
        placeholder="Select Latitude Attribute..."
        attribute={latitudeKey}
        setAttributes={setLatitudeKey}
        maxSelections={1}
        populatedFieldType={"column"}
        additionalPopulatedFieldData={"."}
        allowedTypes={["int", "str"]}
      />
    </Drawer>
  );
}
