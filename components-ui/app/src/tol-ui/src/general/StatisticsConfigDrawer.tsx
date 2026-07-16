/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import {
  AttributeSelector,
  Button,
  deepEqual,
  Drawer,
  IStatisticsConfig,
  IRemoteTargetAndZone,
  RequiredAsterisk,
  TStatisticsType,
  STATISTICS_STAT_TYPES,
} from "..";


export interface PStatisticsConfigDrawer extends IRemoteTargetAndZone {
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
  config: IStatisticsConfig;
  /**
   * Called when a valid configuration is saved
   */
  onConfigSave: (config: IStatisticsConfig) => void;
}

/**
 * StatisticsConfigDrawer provides configuration controls for statistics selection
 * used by BoardStatistics/RemoteStatistics.
 */
export function StatisticsConfigDrawer(props: PStatisticsConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config,
  } = props;  

  const [type, setType] = useState<TStatisticsType>(config.type ?? "count");
  const [field, setField] = useState<string[]>(
    config.field ? [config.field] : []
  );
  const initialConfigRef = useRef({
    type: config.type ?? "count",
    field: config.field ? [config.field] : [],
  });

  const requiresField = type !== "count";
  const hasUpdated = !deepEqual(
    {
      type,
      field,
    },
    initialConfigRef.current
  );
  const hasRequiredFields = !requiresField || field.length > 0;
  const hasPendingChanges = hasUpdated && hasRequiredFields;

  useEffect(() => {
    if (open) {
      const initialConfig = {
        type: config.type ?? "count",
        field: config.field ? [config.field] : [],
      };
      initialConfigRef.current = initialConfig;
      setType(initialConfig.type);
      setField(initialConfig.field);
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
        {STATISTICS_STAT_TYPES.map((stat) => (
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
