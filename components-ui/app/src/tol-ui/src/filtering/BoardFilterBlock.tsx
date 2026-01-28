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
  deepCopy,
  resetFiltersBelow
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: PFilterBlock
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone, setZone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<PFilterBlock>(config);
  const [currentFilterValues, setCurrentFilterValues] = useState<IFilter | undefined>();
  const [currentDefaultFilterValues, setCurrentDefaultFilterValues] = useState<IFilter | undefined>();
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


  // This useEffect is a slim version of the BoardFilters logic to track filter changes and upsert them
  // Exists because the filterBlock does not have filters applied to it, but is the filter itself (so has no need for BoardFilters)
  useEffect(() => {
    const componentData = zone.components[id]?.data;
    if (!componentData) return;

    const newFilterValues = deepCopy(componentData.filter);
    const newDefaultFilterValues = deepCopy(componentData.defaultFilter);

    // Check if filter has changed
    const filterChanged = JSON.stringify(newFilterValues) !== JSON.stringify(currentFilterValues);
    const defaultFilterChanged = JSON.stringify(newDefaultFilterValues) !== JSON.stringify(currentDefaultFilterValues);

    if (filterChanged || defaultFilterChanged) {
      if (filterChanged) {
        resetFiltersBelow({ id: id, zone: zone });
        setZone({ ...zone });

        let attributes = {
          filter: newFilterValues,
          default_filter: newDefaultFilterValues
        };

        upsertComponent(boardDataSource, id, attributes);
      }

      setCurrentFilterValues(newFilterValues);
      setCurrentDefaultFilterValues(newDefaultFilterValues);
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
