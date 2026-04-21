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
  saveTitle,
  BOARDS,
  UtilityBar,
  PButton,
  PBoard,
  useBoard,
  TitleTooltip,
  BUTTONS,
  IView,
  useBoardState,
  IZone,
  IDataObject,
  IComponent,
  getBoardEntity,
  TsDataSource,
  defineComponent
} from "../..";


export interface PZone extends PBoard {
  id: string;
  onZoneReorder?: any;
  onDeleteZone?: any;
  view: IView;
  setView: (view: IView) => void;
}

export function Zone(props: PZone) {
  const {
    id,
    boardDataSource,
    onZoneReorder,
    onDeleteZone,
    view,
    setView
  } = props;

  const { editMode, layoutMode } = useBoard();

  const [zone, setZone] = useBoardState<IView, IZone>(
    "zones",
    id,
    view,
    setView,
  );
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [title, setTitle] = useState(zone?.title);

  useEffect(() => {
    const dataObjectsToComponent = (dataObject: IDataObject, joiningObject: IDataObject): IComponent => {
      const dsi = dataObject?.relationships?.data_source_instance as IDataObject;
      return defineComponent({
        id: dataObject.id,
        title: dataObject.title,
        objectType: dataObject.object_type,
        filter: dataObject.filter,
        componentZoneId: joiningObject?.id,
        componentZoneOrder: joiningObject?.order,
        dataspace: new TsDataSource({
          dataSourceInstanceId: dsi?.id,
          ...dsi?.ui_api_details,
        }),
        type: dataObject.component_type,
        config: dataObject.config,
        size: dataObject.widget_type,
        filterPassThrough: dataObject.filter_pass_through,
      });
    }

    getBoardEntity<IZone, IComponent>(
      id,
      "zone_id",
      BOARDS.COMPONENT_ZONE,
      BOARDS.COMPONENT,
      dataObjectsToComponent,
      boardDataSource,
      ["component.data_source_instance.ui_api_details"]
    ).then((zone: IZone) => {
      setZone(zone);
    });
  }, []);

  const onAddComponent = () => {
    setOpen(true);
  };

  const ConfirmModal = (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      onConfirmClick={() => onDeleteZone(id)}
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
          <TitleTooltip {...zone} />
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
          zone={zone}
          setZone={setZone}
        />
      </div>
    </div>
  );

  return (
    <div className="tol-zone">
      {(title || editMode) && bar}
      {(zone && zone.order && zone.order.length > 0) ? (
        <Visualisations
          id={id}
          zone={zone}
          setZone={setZone}
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
        id={id}
        boardObjectType={BOARDS.ZONE}
        boardDataSource={boardDataSource}
        dataSource={zone.dataspace!}
        objectType={zone.objectType!}
        open={openFilters}
        setOpen={setOpenFilters}
        zone={zone}
        setZone={setZone}
      />
    </div>
  );
}
