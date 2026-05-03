/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
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
  IZone,
  IView,
  getBoardEntity,
  BOARD_CHILDREN_KEYS,
  dataObjectsToZoneParams,
  deleteBoardEntityInParent,
  PRIVILEGE,
  PUtilityBar,
  mergeUtilityBarConfigs,
} from "../..";


export interface PView extends PBoard {
  /**
   * The ID of the view.
   */
  id: string;
  /**
   * The data source for fetching board data.
  */
  utilityBarConfig?: PUtilityBar;
}

export function View(props: PView) {
  const { id, utilityBarConfig, boardDataSource, actionsDataSource } = props;

  const { editMode, setEditMode, privilege, layoutMode, board, setBoard } = useBoard();

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
      /*
        If the view is empty and the user has edit privileges,
        set edit mode to true to encourage them to add content
      */
      if (v.order.length === 0 && privilege === PRIVILEGE.BOARD.EDITABLE) {
        setEditMode(true);
      }
    })
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

  const onZoneReorder = async (id: string, orderChange: number) => {
    // TODO: reorder
  };

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      id: "view-utility-bar",
      buttons: [
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
      ]
    })

  const Bar = (
    <div className="tol-board-bar">
      <UtilityBar {...ubc} />
    </div>
  )

  return (
    <div className="tol-view">
      {Bar}
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
