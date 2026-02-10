/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  saveTitle,
  PButton,
  useBoardPrivilege,
  PRIVILEGE,
  PVisualisation,
  FilterBlockConfigDrawer,
  updateConfigAndUpsert,
  Placeholder,
  Icon,
  RemoteFilters,
  upsertComponent
} from "..";

export interface PBoardFilterBlock extends PVisualisation {
  config: { attributes: string[] };
}

export function BoardFilterBlock(props: PBoardFilterBlock) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource, config, zone } = props;
  const [open, setOpen] = useState(false);
  const [filterBlockConfig, setFilterBlockConfig] = useState<{ attributes: string[] }>(config);
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
      <RemoteFilters
        {...props}
        customClassname="tol-block-filter-col"
        attributes={filterBlockConfig.attributes || []}
        componentId={id}
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
