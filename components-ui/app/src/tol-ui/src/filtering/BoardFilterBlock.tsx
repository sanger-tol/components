/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  PButton,
  useBoard,
  PVisualisation,
  FilterBlockConfigDrawer,
  updateConfigAndUpsert,
  Placeholder,
  Icon,
  RemoteFilters,
  upsertComponent,
  mergeUtilityBarConfigs
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
    updateConfigAndUpsert(
      id,
      { attributes: updatedConfig },
      zone,
      boardDataSource
    )
  };

  useEffect(() => {
    let attributes = {
      filter: zone.components[id].data.filter
    };
    upsertComponent(boardDataSource, id, attributes);
  }, [zone]);

  const Contents = () => {
    if (!filterBlockConfig.attributes || filterBlockConfig.attributes.length === 0) {
      return (
        <div style={{ height: '60%' }}>
          <Placeholder
            message={
              <>
                {editMode ? (
                  <>
                    Please add attributes to get started. Click <Icon icon="sliders" size="sm" /> to configure.
                  </>
                ) : (
                  <>
                    No attributes selected.
                  </>
                )}
              </>
            }
          />
        </div>
      )
    }
    return null;
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
    <>
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
    </>
  );
}
