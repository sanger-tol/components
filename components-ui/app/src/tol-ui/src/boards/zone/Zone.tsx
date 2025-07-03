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
  ResponsiveWidget,
  IWidgets,
  ConfirmationModal,
  getComponents,
  saveTitle,
  TsDataSource,
  BOARDS,
  UtilityBar,
  IButton,
} from "../..";

interface Props {
  id: string;
  title: string;
  objectType: string;
  dataSource: TsDataSource;
  boardDataSource: TsDataSource;
  filter: any;
  onZoneReorder: any;
  deleteZone: any;
}

export function Zone(props: Props) {
  const { 
    id,
    objectType,
    dataSource,
    boardDataSource,
    filter,
    onZoneReorder,
    deleteZone,
  } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<IWidgets[]>([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [editBtnsVisible, setEditBtnsVisible] = useState(false);
  const [saveLayout, setSaveLayout] = useState(false);
  const [title, setTitle] = useState(props.title);
  const z = useZone({
    dataSource,
    objectType,
    filter: filter,
    components: [],
  });

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  };

  const handleBtnsVisible = () => {
    setEditBtnsVisible(!editBtnsVisible);
  };

  const confirmationModal = (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      onConfirmClick={() => deleteZone(id)}
      itemType={BOARDS.ZONE}
    />
  );

  useEffect(() => {
    getComponents(id, boardDataSource).then((components: any) => {
      // sort the widgets based on the order value
      const sortedWidgets = components.sort((a, b) => a.order - b.order);
      sortedWidgets.forEach((widget) => {
        z.zone.components[widget.componentId] = {
          data: {
            defaultFilter: widget.filter,
            filter: widget.filter,
            id: widget.componentId,
            order: widget.order,
            filterPassThrough: widget.filterPassThrough,
          },
        };
        z.zone.order.push(widget.componentId);
      });
      z.setZone({ ...z.zone });
      setCurrentWidgets(components);
    });
  }, []);

  const onAddComponent = () => {
    setOpen(true);
  };

  const addButton : IButton = {
    outline: true,
    onClick: () => {
      onAddComponent();
    },
    type: "success",
    icon: "plus",
    position: "right",
    tooltip: "Add Widget"
  };

  const editButton: IButton = {
    outline: true,
    onClick: () => {
      setDraggable(!draggable);
    },
    disabled: currentWidgets.length < 1,
    type: "edit",
    icon: "up-down-left-right",
    position: "right",
    tooltip: "Edit Widgets"
  };
  
  const deleteButton: IButton = {
    outline: true,
    onClick: () => {
      handleOpenModal();
    },
    type: "error",
    icon: "trash",
    position: "right",
    tooltip: "Delete Zone"
  };
  
  const upButton: IButton = {
    outline: true,
    onClick: async () => {
      await onZoneReorder(id, "up");
    },
    type: "primary",
    icon: "arrow-up",
    position: "right",
    tooltip: "Move Zone Up"
  };
  
  const downButton: IButton = {
    outline: true,
    onClick: async () => {
      await onZoneReorder(id, "down");
    },
    type: "primary",
    icon: "arrow-down",
    position: "right",
    tooltip: "Move Zone Down"
  };
  
  const saveButton: IButton = {
    outline: false,
    onClick: () => {
      setSaveLayout(true);
      setDraggable(false);
    },
    type: "success",
    icon: "floppy-disk",
    position: "right",
    tooltip: "Save Layout"
  };
  
  const filtersButton: IButton = {
    outline: true,
    onClick: () => setOpenFilters(true),
    type: "primary",
    icon: "filter",
    position: "right",
    tooltip: "Add filters to the Zone"
  };
  
  const showEditButtons: IButton = {
    outline: !editBtnsVisible,
    onClick: () => {
      handleBtnsVisible();
    },
    type: editBtnsVisible ? "success" : "warning",
    icon: editBtnsVisible ? "check" : "pen-to-square",
    position: "right",
    tooltip: editBtnsVisible ? "Save Changes" : "Edit Zone"
  };

  const buttons = (
    <div className="tol-zone-bar">
      <UtilityBar
        id="zone-utility-bar"
        title= {{
          text: title,
          editable: true,
          onSave: (value: string) => {
            if (value !== title) {
              saveTitle(value, boardDataSource, id, BOARDS.ZONE);
              setTitle(value);
            }
          }
        }}
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
          currentWidgets={currentWidgets}
          setCurrentWidgets={setCurrentWidgets}
          boardsDataSource={boardDataSource}
          {...z}
        />
      </div>
    </div>
  );

  return (
    <div className="tol-zone">
      {buttons}
      {currentWidgets.length > 0 ? (
        <ResponsiveWidget
          id={id}
          widgets={currentWidgets!}
          setWidgets={setCurrentWidgets}
          draggable={draggable}
          zone={z.zone}
          setZone={z.setZone}
          saveLayout={saveLayout}
          setSaveLayout={setSaveLayout}
          boardDataSource={boardDataSource}
        />
      ) : (
        <div className="tol-zone-empty">
          {editBtnsVisible ? (
            <p>
              Click the
              <FontAwesomeIcon
                icon={faPlus}
                size="lg"
                style={{ padding: "0 8" }}
              />
              to add a new Component to the Zone.
            </p>
          ) : (
            <div>
              <p style={{ marginBottom: "0" }}>
                Click the
                <FontAwesomeIcon
                  icon={faPlus}
                  size="lg"
                  style={{ padding: "0 8" }}
                />
                to add a new Component to the Zone.
              </p>
              <p>
                Click the
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  size="lg"
                  style={{ padding: "0 8" }}
                />
                to edit the Zone.
              </p>
            </div>
          )}
        </div>
      )}
      {confirmationModal}
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
