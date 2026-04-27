/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  ZoneModal,
  Zone,
  BOARDS,
  PBoard,
  useBoard,
  UtilityBar,
  BUTTONS,
  useBoardState,
  IBoard,
  IZone,
  IView,
  getBoardEntity,
  BOARD_CHILDREN_KEYS,
  dataObjectsToZoneParams,
} from "../..";


export interface PView extends PBoard {
  id: string;
}

export function View(props: PView) {
  const { id, boardDataSource, actionsDataSource } = props;

  const { editMode, layoutMode, board, setBoard } = useBoard();

  const [view, setView] = useBoardState<IBoard, IView>(
    BOARD_CHILDREN_KEYS.VIEWS,
    id,
    board,
    setBoard,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getBoardEntity<IView, IZone>(
      boardDataSource,
      id,
      BOARDS.VIEW,
      view,
      dataObjectsToZoneParams
    ).then((v: IView) => {
      setView(v);
    })
  }, []);

  const onDeleteZone = (id: string) => {
    // boardDataSource
    //   .deleteByID({
    //     objectType: BOARDS.ZONE,
    //     id
    //   })
    // deleteBoardEntity<IView>("zones", id, view);
  };

  const onZoneReorder = async (id: string, orderChange: number) => {
    // const newOrder = reorderBoardEntityItem(
    //   id,
    //   view.order,
    //   orderChange,
    // );
    // TODO: update state
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
  )

  return (
    <div className="tol-view">
      {editMode && Bar}
      {(view.order.length) > 0 ? (
        <div className="tol-zones">
          {view.order?.map((zoneId) => {
            const zone = view.zones?.[zoneId];
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
      ) : (
        <div className="tol-zone-empty">
          {editMode ? (
            <p>Click the + button to add a Zone</p>
          ) : (
            <p>No zones found</p>
          )}
        </div>
      )}
      <ZoneModal
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
