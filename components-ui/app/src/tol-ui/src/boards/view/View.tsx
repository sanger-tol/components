/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ZoneCreationModal,
  Zone,
  BOARDS,
  PBoard,
  useBoard,
  useBoardState,
  IBoard,
  IView,
  BOARD_CHILDREN_KEYS,
  deleteBoardEntityInParent,
  PRIVILEGE,
  IZone,
  patchReorderBoardEntity,
  reorderViaDirection
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
    id,
    board,
    setBoard,
  );

  const onDeleteZone = (id: string) => {
    boardDataSource.deleteByID({
      objectType: BOARDS.ZONE,
      id,
    });
    deleteBoardEntityInParent<IView>(id, BOARDS.VIEW, view);
    setView({ ...view });
  };

  const onReorderZone = (id: string, direction: "up" | "down") => {
    const orderedIds = reorderViaDirection(
      [...view.order!],
      id,
      direction
    );
    patchReorderBoardEntity(boardDataSource, view.id!, orderedIds)
      .then(() => {
        view.order = orderedIds;
        setView({ ...view });
      });
  };

  return (
    <div className={`tol-view ${!active ? "tol-view-cached" : ""}`}>
      {view?.order?.length === 0 ? (
        <div className="tol-boards-empty">
          {editMode ? (
            <p>Please click the 'Add Zone' button to get started.</p>
          ) : (
            <p>No zones found</p>
          )}
        </div>
      ) : (
        <div className="tol-zones">
          {view?.order?.map((zoneId) => {
            const zone = view.children?.[zoneId] as IZone;
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
