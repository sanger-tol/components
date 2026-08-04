/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  FilterConfigDrawer,
  ComponentCreationModal,
  Visualisations,
  ConfirmationModal,
  upsertTitle,
  BOARD_ENTITIES,
  UtilityBar,
  useBoard,
  TitleTooltip,
  BUTTONS,
  useBoardState,
  getSiblingBoardEntity,
  mergeFilters,
} from "../..";
import type { IZone, IView, PButton, PBoard, IFilter } from "../..";
import { translateZoneAboveFilter } from "./utils";


export interface PZone extends PBoard {
  id: string;
  view: IView;
  setView: (view: IView) => void;
  onReorderZone: (id: string, direction: "up" | "down") => void;
  onDeleteZone: (id: string) => void;
}

export function Zone(props: PZone) {
  const {
    id,
    view,
    setView,
    boardDataSource,
    onReorderZone,
    onDeleteZone,
    actionsDataSource,
  } = props;

  const { editMode, layoutMode } = useBoard();

  const [zone, setZone] = useBoardState<IView, IZone>(id, view, setView);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [title, setTitle] = useState(zone?.title);

  const { object_type, dataspace, filter } = zone;
  const zoneAbove = getSiblingBoardEntity(id, view, -1) as IZone;

  useEffect(() => {
    updateTranslatedFilter();
  }, [zoneAbove]);

  const updateTranslatedFilter = async () => {
    if (zoneAbove) {
      const translatedFilter: IFilter = await translateZoneAboveFilter(zone, zoneAbove);

      // Requires persisted filter to be merged with the 'live' translated filter
      const compoundedFilter = mergeFilters(translatedFilter, zone.defaultFilter);
      zone.filter = compoundedFilter;
      setZone({ ...zone });
    }
  };

  const onAddComponent = () => {
    setOpen(true);
  };

  const deleteButton: PButton = {
    ...BUTTONS.DISCARD,
    onClick: () => setConfirmationModalOpen(true),
    tooltip: "Delete Zone",
    visible: editMode && !layoutMode,
  };

  const addButton: PButton = {
    onClick: () => {
      onAddComponent();
    },
    type: "success",
    icon: "cube",
    position: "right",
    tooltip: "",
    testid: "add-component-button",
    visible: editMode && !layoutMode,
    text: "Add Component",
  };

  const upButton: PButton = {
    outline: true,
    onClick: () => {
      onReorderZone(id, "up");
    },
    type: "primary",
    icon: "arrow-up",
    position: "right",
    tooltip: "Move Zone Up",
    visible: layoutMode,
    testid: "move-zone-up-button",
  };

  const downButton: PButton = {
    outline: true,
    onClick: () => {
      onReorderZone(id, "down");
    },
    type: "primary",
    icon: "arrow-down",
    position: "right",
    tooltip: "Move Zone Down",
    visible: layoutMode,
    testid: "move-zone-down-button",
  };

  const filtersButton: PButton = {
    outline: true,
    onClick: () => setOpenFilters(true),
    type: "primary",
    icon: "filter",
    position: "right",
    tooltip: "Add filters to the Zone",
    visible: editMode && !layoutMode,
  };

  const translatorsButton: PButton = {
    ...BUTTONS.TRANSLATORS,
    //visible: editMode && !layoutMode,
    // TODO FUTURE: Implement translators
    visible: false,
    onClick: () => { },
  };

  const bar = (
    <div className="tol-zone-bar">
      <UtilityBar
        id="zone-utility-bar"
        title={{
          text: title,
          editable: editMode,
          onSave: (value: string) => {
            if (value !== title) {
              upsertTitle(value, id, boardDataSource);
              setTitle(value);
            }
          },
          hideButtons: true,
        }}
        description={
          <TitleTooltip
            title={title!}
            objectType={object_type!}
            dataSource={dataspace!}
            filter={filter}
            id={id}
          />
        }
        buttons={[
          deleteButton,
          addButton,
          filtersButton,
          downButton,
          upButton,
          translatorsButton,
        ]}
      />
      <div id="component-modal">
        <ComponentCreationModal
          open={open}
          setOpen={setOpen}
          boardDataSource={boardDataSource}
          zone={zone}
          setZone={setZone}
        />
      </div>
    </div>
  );

  return (
    <div className="tol-zone" data-testid="zone">
      {(title || editMode) && bar}
      {zone && zone.order && zone.order.length > 0 ? (
        <Visualisations
          id={id}
          zone={zone}
          setZone={setZone}
          boardDataSource={boardDataSource}
          actionsDataSource={actionsDataSource}
        />
      ) : (
        <div className="tol-boards-empty">
          {editMode ? (
            <p>
              Please click the 'Add Component' button to start adding tables,
              charts and more.
            </p>
          ) : (
            <p>No Components found in Zone</p>
          )}
        </div>
      )}
      <ConfirmationModal
        setOpen={setConfirmationModalOpen}
        open={confirmationModalOpen}
        onConfirmClick={() => onDeleteZone(id)}
        itemType={BOARD_ENTITIES.ENTITIES.ZONE}
      />
      <FilterConfigDrawer
        id={id}
        boardObjectType={BOARD_ENTITIES.ENTITIES.ZONE}
        boardDataSource={boardDataSource}
        dataSource={zone.dataspace!}
        objectType={zone.object_type!}
        open={openFilters}
        setOpen={setOpenFilters}
        zone={zone}
        setZone={setZone}
      />
    </div>
  );
}
