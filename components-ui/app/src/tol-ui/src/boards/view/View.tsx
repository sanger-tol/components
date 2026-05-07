/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import {
  ZoneCreationModal,
  Zone,
  BOARDS,
  PBoard,
  useBoard,
  useBoardState,
  IBoard,
  IZone,
  IView,
  getBoardEntity,
  BOARD_CHILDREN_KEYS,
  dataObjectsToZoneParams,
  deleteBoardEntityInParent,
} from "../..";


export interface PView extends PBoard {
  /**
   * The ID of the view.
   */
  id: string;
  /**
   * Open state for the zone creation modal.
   */
  open: boolean;
  /**
   * Function to set the open state of the zone creation modal.
   */
  setOpen: (open: boolean) => void;
  /**
   * Whether to show the view in the DOM.
   */
  active?: boolean;
}

export function View(props: PView) {
  const { id, open, setOpen, active, boardDataSource, actionsDataSource } = props;

  const { editMode, board, setBoard } = useBoard();

  const [view, setView] = useBoardState<IBoard, IView>(
    BOARD_CHILDREN_KEYS.VIEWS,
    id,
    board,
    setBoard,
  );

  useEffect(() => {
    getBoardEntity<IView, IZone>(
      boardDataSource,
      id,
      BOARDS.VIEW,
      view,
      dataObjectsToZoneParams
    ).then((v: IView) => {
      setView(v);
    });
  }, []);

  const onDeleteZone = (id: string) => {
    boardDataSource
      .deleteByID({
        objectType: BOARDS.ZONE,
        id
      })
    deleteBoardEntityInParent<IView>(id, BOARDS.VIEW, view);
    setView({ ...view });
  };

  const onReorderZone = async (id: string, orderChange: number) => {
    // TODO: reorder
  };

  return (
    <div className={`tol-view ${!active ? "tol-view-cached" : ""}`}>
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
            const zone = view.zones?.[zoneId];
            if (zone) {
              return (
                <Zone
                  key={zone.id}
                  id={zone.id!}
                  onReorderZone={onReorderZone}
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
