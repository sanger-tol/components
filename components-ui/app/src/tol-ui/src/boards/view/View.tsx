/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  ZoneCreationModal,
  Zone,
  BOARDS,
  PBoard,
  useBoard,
  UtilityBar,
  BUTTONS,
  useBoardState,
  IBoard,
  IView,
  BOARD_CHILDREN_KEYS,
  deleteBoardEntityInParent,
  PRIVILEGE,
} from "../..";

export interface PView extends PBoard {
  id: string;
}

export function View(props: PView) {
  const { id, boardDataSource, actionsDataSource } = props;

  const { editMode, setEditMode, privilege, layoutMode, board, setBoard } =
    useBoard();

  const [view, setView, zones] = useBoardState<IBoard, IView>(
    BOARD_CHILDREN_KEYS.VIEWS,
    id,
    board,
    setBoard,
  );
  const [open, setOpen] = useState(false);

  if (
    view.order.length === 0 &&
    privilege === PRIVILEGE.BOARD.WRITABLE &&
    !editMode
  ) {
    setEditMode(true);
  }

  const onDeleteZone = (id: string) => {
    boardDataSource.deleteByID({
      objectType: BOARDS.ZONE,
      id,
    });
    deleteBoardEntityInParent<IView>(id, BOARDS.VIEW, view);
    setView({ ...view });
  };

  const onZoneReorder = async (id: string, orderChange: number) => {
    // TODO: reorder
  };

  const Bar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="view-utility-bar"
        buttons={[
          {
            ...BUTTONS.ADD,
            testid: "open-add-zone-modal-button",
            visible: editMode && !layoutMode,
            onClick: () => {
              setOpen(true);
            },
            tooltip: "",
            text: "Add Zone",
            icon: "object-group",
          },
        ]}
      />
    </div>
  );

  return (
    <div className="tol-view">
      {editMode && Bar}
      {view.order.length === 0 ? (
        <div className="tol-boards-empty">
          {editMode ? (
            <p>Please click the 'Add Zone' button to get started.</p>
          ) : (
            <p>No zones found</p>
          )}
        </div>
      ) : (
        <div className="tol-zones">
          {view.order?.map((zoneId) => {
            const zone = zones[zoneId];
            if (zone) {
              return (
                <Zone
                  key={zone.id}
                  id={zone.id!}
                  onZoneReorder={onZoneReorder}
                  onDeleteZone={onDeleteZone}
                  boardDataSource={boardDataSource}
                  view={view}
                  setView={setView}
                  actionsDataSource={actionsDataSource}
                />
              );
            }
          })}
        </div>
      )}
      <ZoneCreationModal
        open={open}
        setOpen={setOpen}
        viewId={id}
        view={view}
        setView={setView}
        boardDataSource={boardDataSource}
      />
    </div>
  );
}
