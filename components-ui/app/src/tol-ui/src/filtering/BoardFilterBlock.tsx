/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  saveTitle,
  PButton,
  useBoardPrivilege,
  PRIVILEGE,
  PVisualisation,
  PFilterBlock,
  FilterBlock,
  FilterBlockConfigDrawer,
  updateConfigAndUpsert,
  upsertComponent,
  IFilter,
  deepCopy
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: PFilterBlock
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<PFilterBlock>(config);
  const [currentFilterValues, setCurrentFilterValues] = useState<IFilter | undefined>();
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

  useEffect(() => {
    const newFilterValues = deepCopy(zone.components[id]?.data.filter);
    if (newFilterValues !== currentFilterValues) {
      let attributes = {
        filter: newFilterValues
      };
      upsertComponent(boardDataSource, id, attributes);
      setCurrentFilterValues(newFilterValues);
    }
  }, [zone]);

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
