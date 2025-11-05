/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
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
  normaliseCaps,
  useBoardPrivilege,
  PRIVILEGE,
  TsDataSource,
  IDataspaceMeta
} from "../..";


export interface PZone extends PBoard {
  id: string;
  title: string;
  objectType: string;
  dataspaceMeta: IDataspaceMeta;
  filter: any;
  onZoneReorder: any;
  deleteZone: any;
}

export function Zone(props: PZone) {
  const {
    id,
    objectType,
    dataspaceMeta,
    boardDataSource,
    filter,
    onZoneReorder,
    deleteZone,
  } = props;
  const [draggable, setDraggable] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [editBtnsVisible, setEditBtnsVisible] = useState(false);
  const [saveLayout, setSaveLayout] = useState(false);
  const [title, setTitle] = useState(props.title);
  const z = useZone({
    dataSource: dataspaceMeta.dataspace,
    objectType,
    filter: filter,
    components: [],
  });
  const { privilege } = useBoardPrivilege();

  useEffect(() => {
    getComponents(id, boardDataSource).then((components) => {
      // sort the widgets based on the order value
      const sortedComponents = components!.sort((a, b) => a.order! - b.order!);
      addComponents(sortedComponents, z.zone);
      z.setZone({ ...z.zone });
    });
  }, []);

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  };

  const handleBtnsVisible = () => {
    setEditBtnsVisible(!editBtnsVisible);
  };

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
    tooltip: "Add Component",
    testid: "add-component-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const editButton: PButton = {
    outline: true,
    onClick: () => {
      setDraggable(!draggable);
    },
    disabled: z.zone.order.length < 1,
    type: "edit",
    icon: "up-down-left-right",
    position: "right",
    tooltip: "Edit Widgets",
    testid: "drag-components-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const deleteButton: PButton = {
    outline: true,
    onClick: () => {
      handleOpenModal();
    },
    type: "error",
    icon: "trash",
    position: "right",
    tooltip: "Delete Zone",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
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
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
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
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const saveButton: PButton = {
    outline: false,
    onClick: () => {
      setSaveLayout(true);
      setDraggable(false);
    },
    type: "success",
    icon: "floppy-disk",
    position: "right",
    tooltip: "Save Layout",
    testid: "save-layout-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const filtersButton: PButton = {
    outline: true,
    onClick: () => setOpenFilters(true),
    type: "primary",
    icon: "filter",
    position: "right",
    tooltip: "Add filters to the Zone",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const showEditButtons: PButton = {
    outline: !editBtnsVisible,
    onClick: () => {
      handleBtnsVisible();
    },
    type: editBtnsVisible ? "success" : "warning",
    icon: editBtnsVisible ? "check" : "pen-to-square",
    position: "right",
    tooltip: editBtnsVisible ? "Save Changes" : "Edit Zone",
    testid: "edit-zone-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE
  };

  const buttons = (
    <div className="tol-zone-bar">
      <UtilityBar
        id="zone-utility-bar"
        title={{
          text: title,
          editable: privilege === PRIVILEGE.BOARD.EDITABLE,
          onSave: (value: string) => {
            if (value !== title) {
              saveTitle(value, id, BOARDS.ZONE, boardDataSource);
              setTitle(value);
            }
          }
        }}
        description={normaliseCaps(objectType) + " Zone"}
        buttons={!draggable ? [
          addButton,
          showEditButtons,
          ...(editBtnsVisible
            ? [deleteButton, editButton, downButton, upButton]
            : []),
          filtersButton
        ] : [saveButton]}
      />
      <div id="component-modal">
        <ComponentPickerModal
          open={open}
          setOpen={setOpen}
          zoneId={id}
          boardDataSource={boardDataSource}
          {...z}
        />
      </div>
    </div>
  );

  return (
    <div className="tol-zone">
      {buttons}
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
          {privilege === PRIVILEGE.BOARD.EDITABLE ? (
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
              {!editBtnsVisible && (
                <p>
                  Click the
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    size="lg"
                    style={{ padding: "0 8" }}
                  />
                  to edit the Zone.
                </p>
              )}
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
