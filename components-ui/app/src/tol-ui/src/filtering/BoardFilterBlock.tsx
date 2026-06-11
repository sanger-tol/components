/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  PButton,
  useBoard,
  PVisualisation,
  FilterBlockConfigDrawer,
  RemoteFilters,
  mergeUtilityBarConfigs,
  NoAttributesPlaceholder,
  updateComponentConfigAndUpsert,
} from "..";


export interface PBoardFilterBlock extends PVisualisation {
  config: { attributes: string[] };
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardDataSource, config, zone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<{ attributes: string[] }>(config);
  const { editMode } = useBoard();

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpen(true),
    icon: "sliders",
    visible: editMode,
  }

  const onConfigSave = (updatedConfig: string[]) => {
    setFilterBlockConfig({ attributes: updatedConfig });
    updateComponentConfigAndUpsert(
      id,
      { attributes: updatedConfig },
      zone,
      boardDataSource,
      editMode,
    )
  };

  useEffect(() => {
    // TODO: WORK!!!
    let attributes = {
      filter: zone.children[id].filter
    };
    //upsertComponent(boardDataSource, id, attributes);
  }, [zone]);

  const Contents = () => {
    if (!filterBlockConfig.attributes || filterBlockConfig.attributes.length === 0) {
      return <NoAttributesPlaceholder />;
    }
  }

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        configButton,
      ],
    }
  )

  return (
    <div className="tol-component-contents with-offset">
      <FilterBlockConfigDrawer
        {...props}
        open={open}
        setOpen={setOpen}
        title="Filter Configuration"
        filterBlockConfig={filterBlockConfig.attributes}
        onConfigSave={onConfigSave}
      />
      <RemoteFilters
        {...props}
        className="tol-block-filter-col"
        attributes={filterBlockConfig.attributes || []}
        componentId={id}
        utilityBarConfig={ubc}
      />
      <Contents />
    </div>
  );
}
