/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardStatistics,
  BoardTable,
  BoardSunburst,
  BoardChart,
  IBoardTargetAndZone,
  BoardMarkdown,
  PUtilityBar,
  useBoard,
  upsertTitle,
  BOARD_ENTITIES,
  PButton,
  TitleTooltip,
  mergeUtilityBarConfigs,
  BoardFilterBlock,
  FilterConfigDrawer,
  BUTTONS,
  ConfirmationModal,
  BoardMap,
  TsDataSource,
} from "../..";


export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  title: string;
  utilityBarConfig?: PUtilityBar;
  actionsDataSource: TsDataSource;
  onDeleteComponent: (id: string) => void;
}

export function Visualisation(props: PVisualisation) {
  const {
    id,
    componentType,
    boardDataSource,
    zone,
    utilityBarConfig,
    onDeleteComponent,
  } = props;

  const { editMode, layoutMode } = useBoard();

  const [title, setTitle] = useState(props.title);
  const [openFilters, setOpenFilters] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    visible: editMode && !layoutMode,
    testid: `${componentType}-filter-button`
  }

  const deleteButton: PButton = {
    ...BUTTONS.DISCARD,
    onClick: () => setConfirmationModalOpen(true),
    tooltip: "Delete Component",
    visible: editMode && !layoutMode,
    testid: `delete-${componentType}-button`
  }

  const FilterDrawer = (
    <FilterConfigDrawer
      {...props}
      open={openFilters}
      setOpen={setOpenFilters}
    />
  )

  const Description = (
    <TitleTooltip
      {...zone}
    />
  );

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      title: title || editMode ? {
        text: title,
        editable: editMode,
        onSave: (value: string) => {
          upsertTitle(value, id, boardDataSource);
          setTitle(value);
        }
      } : undefined,
      description: Description,
      buttons: [
        deleteButton,
        filterButton,
      ],
      elements: [
        FilterDrawer
      ]
    }
  )

  let Component: JSX.ElementType = BoardTable;

  switch (componentType) {
    case "count":
    case "statistics":
      Component = BoardStatistics;
      break;
    case "sunburst":
      Component = BoardSunburst;
      break;
    case "chart":
      Component = BoardChart;
      break;
    case "text":
      Component = BoardMarkdown;
      break;
    case "filterBlock":
      Component = BoardFilterBlock;
      break;
    case "map":
      Component = BoardMap;
  }

  const Visualisation = (
    <Component
      {...props}
      utilityBarConfig={ubc}
    />
  );

  if (layoutMode) {
    return (
      <div className="tol-draggable-widget">
        <div className="tol-draggable-widget-content">
          {Visualisation}
        </div>
        <div
          className="tol-draggable-widget-overlay"
          aria-hidden="true"
        >
          <h3>
            {title}
          </h3>
        </div>
      </div>
    )
  }

  return (
    <>
      {Visualisation}
      <ConfirmationModal
        setOpen={setConfirmationModalOpen}
        open={confirmationModalOpen}
        onConfirmClick={() => onDeleteComponent(id)}
        itemType={BOARD_ENTITIES.COMPONENT}
      />
    </>
  );
}
