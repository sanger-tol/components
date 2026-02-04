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
  FilterBlockConfigDrawer,
  updateConfigAndUpsert,
  upsertComponent,
  IFilter,
  Placeholder,
  Icon,
  AttributeFilters
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: {attributes: string[]};
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone, setZone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<{attributes: string[]}>(config);
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
    upsertComponent(boardDataSource, id, { filter: currentFilterValues })
  }, [currentFilterValues]);

  const Contents = () => {
    if (filterBlockConfig && filterBlockConfig.attributes.length === 0) {
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
        filterBlockConfig={filterBlockConfig.attributes}
        onConfigSave={onConfigSave}
        {...props}
      />
      <AttributeFilters
        {...props}
        // contents={Contents()}
        attributes={filterBlockConfig.attributes || []}
        componentId={id}
        setFilters={setCurrentFilterValues}
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
      <Contents />
    </>
  );
}
