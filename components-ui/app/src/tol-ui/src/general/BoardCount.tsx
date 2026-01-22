/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  CountConfigDrawer,
  ICountConfig,
  Icon,
  Placeholder,
  RemoteCount,
  deepCopy,
  saveTitle,
  PButton,
  useBoardPrivilege,
  PRIVILEGE,
  PVisualisation,
  UtilityBar,
  updateConfigAndUpsert,
} from "..";

export interface PBoardCount extends PVisualisation {}

export function BoardCount(props: PBoardCount) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, zone } = props;
  const initialConfig = props.config && props.config.type ? props.config : { type: "count" };
  const [config, setConfig] = useState<ICountConfig>(initialConfig);
  const [hasConfigured, setHasConfigured] = useState(!!initialConfig.type);
  const [openFilters, setOpenFilters] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const { privilege } = useBoardPrivilege();

  const onConfigSave = (updatedConfig: ICountConfig) => {
    setConfig({ ...updatedConfig });
    setHasConfigured(true);
    updateConfigAndUpsert(id, { ...updatedConfig }, zone, boardDataSource);
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  };

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    testid: "count-filter-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  };

  const utilityBarProps = {
    ...utilityBarConfig,
    title: {
      text: utilityBarConfig.title?.text,
      editable: privilege === PRIVILEGE.BOARD.EDITABLE,
      onSave: (value: string) => {
        saveTitle(value, id, boardObjectType, boardDataSource);
      },
    },
    buttons: [configButton, filterButton],
  };

  const isConfigured =
    hasConfigured && (config.type === "count" || !!config.field);

  const EmptyState = () => (
    <div style={{ height: "100%" }}>
      <Placeholder
        bar
        message={
          <>
            {privilege === PRIVILEGE.BOARD.EDITABLE ? (
              <>
                Please add attributes to get started. Click <Icon icon="sliders" size="lg" /> to configure.
              </>
            ) : (
              <>No attributes selected.</>
            )}
          </>
        }
      />
    </div>
  );

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <CountConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        title="Stats Configuration"
        config={deepCopy(config)}
        onConfigSave={onConfigSave}
      />
      {isConfigured ? (
        <RemoteCount
          {...props}
          type={config.type}
          field={config.field}
          utilityBarConfig={utilityBarProps}
        />
      ) : (
        <>
          <UtilityBar id={id} {...utilityBarProps} />
          <div className="tol-component-contents with-offset">
            <EmptyState />
          </div>
        </>
      )}
    </>
  );
}
