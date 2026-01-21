/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  AttributeSelector,
  Button,
  Drawer,
  ICountConfig,
  IRemoteTargetAndZone,
  RequiredAsterisk,
  TCountStatType,
} from "..";

/**
 * @autodoc
 * CountConfigDrawer provides a configuration UI for RemoteCount stats selection.
 */
export interface PCountConfigDrawer extends IRemoteTargetAndZone {
  /** Whether the drawer is open. */
  open: boolean;
  /** Handler to toggle the drawer. */
  setOpen: (open: boolean) => void;
  /** Drawer title. */
  title: string;
  /** The current count configuration. */
  config: ICountConfig;
  /** Handler invoked when a valid configuration is saved. */
  onConfigSave: (config: ICountConfig) => void;
}

const STAT_TYPES: Array<{ label: string; value: TCountStatType }> = [
  { label: "Count", value: "count" },
  { label: "Minimum", value: "min" },
  { label: "Maximum", value: "max" },
  { label: "Average", value: "avg" },
  { label: "Sum", value: "sum" },
];

export function CountConfigDrawer(props: PCountConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config,
  } = props;  

  const [type, setType] = useState<TCountStatType | "">(config.type ?? "");
  const [field, setField] = useState<string[]>(
    config.field ? [config.field] : []
  );

  const requiresField = type !== "" && type !== "count";
  const hasUpdated =
    type !== config.type || field[0] !== config.field || !config.type;
  const hasRequiredFields = !!type && (!requiresField || field.length > 0);
  const hasPendingChanges = hasUpdated && hasRequiredFields;

  useEffect(() => {
    if (open) {
      setType(config.type ?? "");
      setField(config.field ? [config.field] : []);
    }
  }, [open, config.field, config.type]);

  const onSave = () => {
    if (!type) {
      return;
    }
    onConfigSave({
      type,
      field: requiresField ? field[0] : undefined,
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
        Statistic
        <RequiredAsterisk />
      </h6>
      <div className="tol-board-chart-interval-btn-container">
        {STAT_TYPES.map((stat) => (
          <Button
            outline
            key={stat.value}
            text={stat.label}
            type="primary"
            onClick={() => setType(stat.value)}
            active={type === stat.value}
            size="lg"
            className="tol-board-chart-interval-buttons"
          />
        ))}
      </div>
      {requiresField && (
        <>
          <h6>
            Field
            <RequiredAsterisk />
          </h6>
          <AttributeSelector
            {...props}
            placeholder="Select field..."
            attribute={field}
            setAttributes={setField}
            maxSelections={1}
            populatedFieldType={"column"}
            additionalPopulatedFieldData={"."}
            allowedTypes={["int", "float"]}
          />
        </>
      )}
    </Drawer>
  );
}
