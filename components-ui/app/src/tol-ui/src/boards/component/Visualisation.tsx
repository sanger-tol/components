/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
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
  DATA_LIST_COMPONENT_TYPES,
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


/** Props for the Visualisation component. */
export interface PVisualisation<TConfig = any> extends IBoardTargetAndZone {
  /** Component identifier. */
  id: string;
  /** Component-specific configuration. */
  config: TConfig;
  /** Visualisation type identifier. */
  componentType: string;
  /** Component size. */
  size: string;
  /** Display title. */
  title: string;
  /** Utility bar configuration. */
  utilityBarConfig?: PUtilityBar;
  /** Data source for component actions. */
  actionsDataSource: TsDataSource;
  /** Callback invoked when the component is deleted. */
  onDeleteComponent: (id: string) => void;
}

/** Props for board visualisations that read or update their config. */
export interface PVisualisationComponent<TConfig = any> extends PVisualisation<TConfig> {
  /** State setter for the visualisation config, owned by `Visualisation`. */
  setConfig: Dispatch<SetStateAction<TConfig>>;
}

/** Component for rendering a board visualisation based on its type. */
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

  const [config, setConfig] = useState(props.config ?? {});
  const [title, setTitle] = useState(props.title);
  const [openFilters, setOpenFilters] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  useEffect(() => {
    setConfig(props.config ?? {});
  }, [props.config]);

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
  let componentSpecificProps: Record<string, unknown> = {};

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
      componentSpecificProps = { type: DATA_LIST_COMPONENT_TYPES.OBJECT_DETAIL };
  }

  const Visualisation = (
    <Component
      {...props}
      config={config}
      setConfig={setConfig}
      {...componentSpecificProps}
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
