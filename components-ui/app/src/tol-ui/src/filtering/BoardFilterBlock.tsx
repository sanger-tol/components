/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  saveTitle,
  PButton,
  useBoardPrivilege,
  PRIVILEGE,
  PVisualisation,
  PFilterBlock,
  FilterBlock,
  FilterBlockConfigDrawer,
  updateConfigAndUpsert
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: PFilterBlock
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<PFilterBlock>(config);
  const { privilege } = useBoardPrivilege();

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpen(true),
    icon: "sliders",
    visible: privilege == PRIVILEGE.BOARD.EDITABLE,
  }

  const onConfigSave = (updatedConfig: PFilterBlock) => {
    setFilterBlockConfig({ ...updatedConfig });
    updateConfigAndUpsert(
      id,
      { ...updatedConfig },
      zone,
      boardDataSource
    )
  };

  return (
    <>
      <FilterBlockConfigDrawer
        open={open}
        setOpen={setOpen}
        title="Filter Configuration"
        filterBlockConfig={filterBlockConfig}
        onConfigSave={onConfigSave}
        {...props}
      />
      <FilterBlock
        {...props}
        filters={filterBlockConfig.filters || { order: [], attributes: {} }}
        utilityBarConfig={{
          ...utilityBarConfig,
          title: {
            text: utilityBarConfig.title?.text,
            editable: privilege === PRIVILEGE.BOARD.EDITABLE,
            onSave: (value: string) => {
              saveTitle(value, id, boardObjectType, boardDataSource);
            },
          },
          buttons: [configButton],
        }}
      />
    </>
  );
}
