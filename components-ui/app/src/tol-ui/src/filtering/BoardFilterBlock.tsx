/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  PButton,
  useBoard,
  PVisualisationComponent,
  FilterBlockConfigDrawer,
  RemoteFilters,
  mergeUtilityBarConfigs,
  NotConfiguredPlaceholder,
  updateComponentConfigAndUpsert,
} from "..";


/** Props for the BoardFilterBlock component. */
export interface PBoardFilterBlock extends PVisualisationComponent {}

/** Component for displaying and configuring board filter blocks. */
export function BoardFilterBlock(props: PVisualisationComponent) {
  const {
    id,
    utilityBarConfig,
    boardDataSource,
    config,
    setConfig,
    zone
  } = props;

  const [open, setOpen] = useState(false);
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
    setConfig({ attributes: updatedConfig });
    updateComponentConfigAndUpsert(
      id,
      { attributes: updatedConfig },
      zone,
      boardDataSource,
      editMode,
    )
  };

  const Contents = () => {
    if (!config.attributes || config.attributes.length === 0) {
      return <NotConfiguredPlaceholder />;
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
        filterBlockConfig={config.attributes}
        onConfigSave={onConfigSave}
      />
      <RemoteFilters
        {...props}
        className="tol-block-filter-col"
        attributes={config.attributes || []}
        componentId={id}
        utilityBarConfig={ubc}
      />
      <Contents />
    </div>
  );
}
