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
  BoardDataList,
  IBoardTargetAndZone,
  BoardMarkdown,
  PUtilityBar,
  useBoard,
  upsertTitle,
  BOARD_ENTITIES,
  COMPONENT_TYPES,
  DATA_LIST_COMPONENT_TYPES_,
  PButton,
  TitleTooltip,
  mergeUtilityBarConfigs,
  BoardFilterBlock,
  FilterConfigDrawer,
  BUTTONS,
  ConfirmationModal,
  BoardMap,
  TsDataSource,
  generateFilter,
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

  const { object_type, dataspace } = zone;
  const filter = generateFilter(zone, id);

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
      title={title}
      objectType={object_type!}
      dataSource={dataspace!}
      filter={filter}
      id={id}
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
        },
        hideButtons: true,
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
  // Extra props only some Component types need, e.g. BoardDataList's `type`.
  let extraProps: Record<string, unknown> = {};

  switch (componentType) {
    case "count":
    case COMPONENT_TYPES.STATISTICS:
      Component = BoardStatistics;
      break;
    case COMPONENT_TYPES.SUNBURST:
      Component = BoardSunburst;
      break;
    case COMPONENT_TYPES.CHART:
      Component = BoardChart;
      break;
    case COMPONENT_TYPES.TEXT:
      Component = BoardMarkdown;
      break;
    case COMPONENT_TYPES.FILTER_BLOCK:
      Component = BoardFilterBlock;
      break;
    case COMPONENT_TYPES.MAP:
      Component = BoardMap;
      break;
    case COMPONENT_TYPES.OBJECT_DETAIL:
      Component = BoardDataList;
      extraProps = { type: DATA_LIST_COMPONENT_TYPES_.OBJECT_DETAIL };
  }

  const Visualisation = (
    <Component
      {...props}
      {...extraProps}
      utilityBarConfig={ubc}
    />
  );

  if (layoutMode) {
    return (
      <div className="tol-draggable-widget" data-testid={`draggable-${title}`}>
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
        itemType={BOARD_ENTITIES.ENTITIES.COMPONENT}
      />
    </>
  );
}
