/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  FilterConfigDrawer,
  ComponentPickerModal,
  Visualisations,
  ConfirmationModal,
  getComponents,
  saveTitle,
  BOARDS,
  UtilityBar,
  PButton,
  PBoard,
  addComponents,
  useBoard,
  TitleTooltip,
  TsDataSource,
  BUTTONS,
  IView,
  useBoardState,
  defineZone,
  IUseZoneMeta
} from "../..";


export interface PZone extends PBoard {
  id: string;
  title: string;
  objectType: string;
  dataspace: TsDataSource;
  filter: any;
  onZoneReorder: any;
  deleteZone: any;
  view: IView;
  setView: (view: IView) => void;
}

export function Zone(props: PZone) {
  const {
    id,
    objectType,
    dataspace,
    boardDataSource,
    filter,
    onZoneReorder,
    deleteZone,
    view,
    setView
  } = props;

  const { editMode, layoutMode } = useBoard();

  const definedZone = defineZone(objectType, [], filter)
  const [zone, setZone] = useBoardState(
    "zones",
    id,
    view,
    setView,
    definedZone
  );

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [title, setTitle] = useState(props.title);

  // UseZone will eventually be phased out as the useBoardState hook
  // allows access to other zones (outside of itself) which is needed
  // for translators to work

  // const z = useZone({
  //   dataSource: dataspace,
  //   objectType,
  //   filter: filter,
  //   components: [],
  // });

  const z = {
    objectType: objectType,
    dataSource: dataspace,
    zone: zone || {
      objectType: objectType,
      components: [],
      filter: filter,
      defaultFilter: filter,
      order: []
    },
    setZone: setZone
  } as IUseZoneMeta;

  // TODO: This z variable sets the zone key with empty values on the initial load
  // This prevents 'not found' errors when getting default filters etc
  // However, it does then not re-render even after the zone (from the Board state hook) is updated
  // To fix this it needs to be updated in a useEffect like the one below but it circular
  // calls

  useEffect(() => {
    getComponents(id, boardDataSource).then((components) => {
      // sort the widgets based on the order value
      const sortedComponents = components!.sort((a, b) => a.order! - b.order!);
      addComponents(sortedComponents, z.zone);
      z.setZone({ ...z.zone });
    });
  }, []);

  const onAddComponent = () => {
    setOpen(true);
  };

  const ConfirmModal = (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      onConfirmClick={() => deleteZone(id)}
      itemType={BOARDS.ZONE}
    />
  );

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
    onClick: async () => {
      await onZoneReorder(id, "up");
    },
    type: "primary",
    icon: "arrow-up",
    position: "right",
    tooltip: "Move Zone Up",
    visible: layoutMode,
  };

  const downButton: PButton = {
    outline: true,
    onClick: async () => {
      await onZoneReorder(id, "down");
    },
    type: "primary",
    icon: "arrow-down",
    position: "right",
    tooltip: "Move Zone Down",
    visible: layoutMode,
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

  // const translatorsButton: PButton = {
  //   ...BUTTONS.TRANSLATORS,
  //   visible: editMode && !layoutMode,
  //   onClick: () => { },
  // };

  const bar = (
    <div className="tol-zone-bar">
      <UtilityBar
        id="zone-utility-bar"
        title={{
          text: title,
          editable: editMode,
          onSave: (value: string) => {
            if (value !== title) {
              saveTitle(value, id, boardDataSource, BOARDS.ZONE);
              setTitle(value);
            }
          }
        }}
        description={
          <TitleTooltip
            title={title}
            objectType={objectType}
            dataSource={dataspace}
            filter={filter}
          />
        }
        buttons={[
          deleteButton,
          addButton,
          filtersButton,
          downButton,
          upButton,
          // translatorsButton
        ]}
      />
      <div id="component-modal">
        <ComponentPickerModal
          open={open}
          setOpen={setOpen}
          zoneId={id}
          boardDataSource={boardDataSource}
          dataspace={dataspace}
          {...z}
        />
      </div>
    </div>
  );

  return (
    <div className="tol-zone">
      {(title || editMode) && bar}
      {(z.zone && z.zone.order.length > 0) ? (
        <Visualisations
          id={id}
          zone={z.zone}
          setZone={z.setZone}
          boardDataSource={boardDataSource}
        />
      ) : (
        <div className="tol-zone-empty">
          {editMode ? (
            <>
              <p>
                Click the
                <FontAwesomeIcon
                  icon={faPlus}
                  size="lg"
                  style={{ padding: "0 8" }}
                />
                to add a new Component to the Zone.
              </p>
            </>
          ) : (
            <p>No components found</p>
          )}
        </div>
      )}
      {ConfirmModal}
      <FilterConfigDrawer
        {...props}
        id={id}
        boardObjectType={BOARDS.ZONE}
        open={openFilters}
        setOpen={setOpenFilters}
        {...z}
      />
    </div>
  );
}
