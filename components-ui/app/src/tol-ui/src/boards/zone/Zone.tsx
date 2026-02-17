/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  useZone,
  BoardFilters,
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
} from "../..";


export interface PZone extends PBoard {
  id: string;
  title: string;
  objectType: string;
  dataspace: TsDataSource;
  filter: any;
  onZoneReorder: any;
  deleteZone: any;
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
  } = props;

  const { editMode } = useBoard();

  const [draggable, setDraggable] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [saveLayout, setSaveLayout] = useState(false);
  const [title, setTitle] = useState(props.title);

  const z = useZone({
    dataSource: dataspace,
    objectType,
    filter: filter,
    components: [],
  });

  useEffect(() => {
    getComponents(id, boardDataSource).then((components) => {
      // sort the widgets based on the order value
      const sortedComponents = components!.sort((a, b) => a.order! - b.order!);
      addComponents(sortedComponents, z.zone);
      z.setZone({ ...z.zone });
    });
  }, []);

  useEffect(() => {
    // if not in edit mode, ensure draggable is false
    if (!editMode) {
      setDraggable(false);
    }
  }, [editMode]);

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

  const addButton: PButton = {
    outline: true,
    onClick: () => {
      onAddComponent();
    },
    type: "success",
    icon: "plus",
    position: "right",
    tooltip: "",
    testid: "add-component-button",
    visible: editMode,
    text: "Add Component",
  };

  const deleteButton: PButton = {
    outline: true,
    onClick: () => {
      setConfirmationModalOpen(true);
    },
    type: "error",
    icon: "trash",
    position: "right",
    tooltip: "Delete Zone",
    visible: editMode
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
    visible: editMode
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
    visible: editMode
  };

  const filtersButton: PButton = {
    outline: true,
    onClick: () => setOpenFilters(true),
    type: "primary",
    icon: "filter",
    position: "right",
    tooltip: "Add filters to the Zone",
    visible: editMode
  };

  const bar = (
    <div className="tol-board-bar">
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
          addButton,
          filtersButton,
          downButton,
          upButton,
          deleteButton,
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
      {z.zone.order.length > 0 ? (
        <Visualisations
          id={id}
          zone={z.zone}
          setZone={z.setZone}
          draggable={draggable}
          saveLayout={saveLayout}
          setSaveLayout={setSaveLayout}
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
      <BoardFilters
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
