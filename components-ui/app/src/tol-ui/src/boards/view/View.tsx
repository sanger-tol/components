/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  ZoneModal,
  IFilter,
  Zone,
  BOARDS,
  PBoard,
  useBoard,
  TsDataSource,
  UtilityBar,
  BUTTONS,
  useBoardState,
  IBoard,
  IZone,
  IView,
  defineZone,
  deleteBoardEntity,
  reorderBoardEntityItem,
  getBoardEntity,
  IDataObject,
} from "../..";


export interface PView extends PBoard {
  id: string;
  defaultFilter?: IFilter;
}

export function View(props: PView) {
  const { id, boardDataSource } = props;

  const { editMode, layoutMode, board, setBoard } = useBoard();

  const [view, setView] = useBoardState<IBoard, IView>(
    "views",
    id,
    board,
    setBoard,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dataObjectsToZone = (dataObject: IDataObject, joiningObject: IDataObject): IZone => {
      const dsi = dataObject?.relationships?.data_source_instance as IDataObject;
      return defineZone({
        id: dataObject.id,
        title: dataObject.title,
        objectType: dataObject.object_type,
        filter: dataObject.filter,
        zoneViewId: joiningObject?.id,
        zoneViewOrder: joiningObject?.order,
        dataspace: new TsDataSource({
          dataSourceInstanceId: dsi?.id,
          ...dsi?.ui_api_details,
        }),
      });
    }

    getBoardEntity<IView, IZone>(
      view,
      id,
      "view_id",
      BOARDS.ZONE_VIEW,
      BOARDS.ZONE,
      dataObjectsToZone,
      boardDataSource,
      ["zone.data_source_instance.ui_api_details"]
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
    deleteBoardEntity<IView>("zones", id, view);
  };

  const onZoneReorder = async (id: string, orderChange: number) => {
    const newOrder = reorderBoardEntityItem(
      id,
      view.order,
      orderChange,
    );
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
      <ZoneModal
        open={open}
        setOpen={setOpen}
        viewId={id}
        view={view}
        setView={setView}
        boardDataSource={boardDataSource}
      />
      {(view?.order?.length ?? 0) > 0 ? (
        <div className="tol-zones">
          {view.order.map((zoneId) => {
            const zone = view.zones[zoneId];
            return (
              <Zone
                key={zone.id}
                id={zone.id!}
                onZoneReorder={onZoneReorder}
                onDeleteZone={onDeleteZone}
                boardDataSource={boardDataSource}
                view={view}
                setView={setView}
              />
            );
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
    </div>
  );
}
