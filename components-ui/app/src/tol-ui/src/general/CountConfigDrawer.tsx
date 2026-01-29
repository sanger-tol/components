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
  COUNT_STAT_TYPES,
} from "..";


export interface PCountConfigDrawer extends IRemoteTargetAndZone {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  config: ICountConfig;
  onConfigSave: (config: ICountConfig) => void;
}

export function CountConfigDrawer(props: PCountConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config,
  } = props;  

  const [type, setType] = useState<TCountStatType>(config.type ?? "count");
  const [field, setField] = useState<string[]>(
    config.field ? [config.field] : []
  );

  const requiresField = type !== "count";
  const hasUpdated = type !== config.type || field[0] !== config.field;
  const hasRequiredFields = !requiresField || field.length > 0;
  const hasPendingChanges = hasUpdated && hasRequiredFields;

  useEffect(() => {
    if (open) {
      setType(config.type ?? "count");
      setField(config.field ? [config.field] : []);
    }
  }, [open, config.field, config.type]);

  const onSave = () => {
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
        {COUNT_STAT_TYPES.map((stat) => (
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
