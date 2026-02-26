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
  saveTitle,
  BOARDS,
  PButton,
  TitleTooltip,
  generateFilter,
  mergeUtilityBarConfigs,
  BoardFilterBlock,
  FilterConfigDrawer,
  removeComponent,
  BUTTONS,
  ConfirmationModal
} from "../..";


export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  componentType: string;
  size: string;
  title: string;
  utilityBarConfig?: PUtilityBar;
}

export function Visualisation(props: PVisualisation) {
  const {
    id,
    objectType,
    componentType,
    boardDataSource,
    zone,
    setZone,
    dataSource,
    utilityBarConfig,
  } = props;

  const { editMode, layoutMode } = useBoard();

  const [title, setTitle] = useState(props.title);
  const [openFilters, setOpenFilters] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const filter = generateFilter(zone, id);

  const onDelete = () => {
    boardDataSource
      .deleteByID({
        objectType: BOARDS.COMPONENT,
        id: id,
      })
    removeComponent(id, zone);
    setZone({ ...zone });
  };

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    visible: editMode && !layoutMode,
  }

  const deleteButton: PButton = {
    ...BUTTONS.DISCARD,
    onClick: () => setConfirmationModalOpen(true),
    tooltip: "Delete Component",
    visible: editMode && !layoutMode,
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
      title={title}
      objectType={objectType}
      dataSource={dataSource}
      filter={filter}
    />
  );

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      title: title || editMode ? {
        text: title,
        editable: editMode,
        onSave: (value: string) => {
          saveTitle(value, id, boardDataSource, BOARDS.COMPONENT);
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
        />
      </div>
    );
  }

  return (
    <>
      {Visualisation}
      <ConfirmationModal
        setOpen={setConfirmationModalOpen}
        open={confirmationModalOpen}
        onConfirmClick={onDelete}
        itemType={BOARDS.COMPONENT}
      />
    </>
  );
}
