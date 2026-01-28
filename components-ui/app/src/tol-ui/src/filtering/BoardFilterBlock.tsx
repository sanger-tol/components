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
  resetFiltersBelow,
  Placeholder,
  Icon
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: PFilterBlock
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone, setZone } = props;
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


  // This useEffect is a slim version of the BoardFilters logic to track filter changes and upsert them
  // Exists because the filterBlock does not have filters applied to it, but is the filter itself
  useEffect(() => {
    const componentData = zone.components[id]?.data;
    if (!componentData) return;

    let newFilterValues = deepCopy(componentData.filter);

    // Remove any filter attributes that are no longer in the filterBlockConfig
    const configuredAttributes = filterBlockConfig.filters?.attributes || {};
    const validAttributeKeys = Object.keys(configuredAttributes).map(key => configuredAttributes[key].attribute);
    if (newFilterValues?.and_) {
      newFilterValues.and_ = Object.fromEntries(
        Object.entries(newFilterValues.and_).filter(([key]) => validAttributeKeys.includes(key))
      );
    }

    // Check if filter has changed
    const filterChanged = JSON.stringify(newFilterValues) !== JSON.stringify(currentFilterValues);

    if (filterChanged ) {
      // If filter has changed, reset filters below and upsert
      if (filterChanged) {
        // Reset filters below this component when the filter changes
        resetFiltersBelow({ id: id, zone: zone });
        setZone({ ...zone });

        let attributes = {
          filter: newFilterValues,
        };

        upsertComponent(boardDataSource, id, attributes);
      }

      setCurrentFilterValues(newFilterValues);
    }
  }, [zone, filterBlockConfig]);


  const Contents = () => {
      if (Object.keys(filterBlockConfig.filters.attributes).length === 0) {
        return (
          <div style={{ height: '60%' }}>
            <Placeholder
              message={
                <>
                  {privilege === PRIVILEGE.BOARD.EDITABLE ? (
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
        contents={Contents()}
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
