/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  ZoneModal,
  IFilter,
  getZones,
  Zone,
  BOARDS,
  PBoard,
  reorderZoneAndUpsert,
  getSortedZones,
  useBoard,
  TsDataSource,
  UtilityBar,
  BUTTONS,
  useBoardState,
  IBoard,
  IZone,
  IView,
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
    { zones: {}, order: [], dbOrder: [] }
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getZones(id, boardDataSource).then((data: any) => {
      const initialZones = data.zones.map((zone: any) => {
        const dsi = zone.relationships.data_source_instance;

        return {
          id: zone.id,
          objectType: zone.object_type,
          title: zone.title,
          filter: zone.filter,
          dataspace: new TsDataSource({
            ...dsi.ui_api_details,
            dataSourceInstanceId: dsi.id,
          }),
        } as IZone;
      });
      console.log(data);
      console.log(initialZones);
      // view.zones = (initialZones);
      // view.zoneDbOrder = data.zoneViewOrder;
    });
  }, []);

  /*
  const deleteZone = (id: string) => {
    boardDataSource
      .deleteByID({
        objectType: BOARDS.ZONE,
        id
      })
    const newZones = zones.filter((zone) => zone.id !== id);
    setZones(newZones);
  };

  const onZoneReorder = async (id: string, direction: string) => {
    reorderZoneAndUpsert(
      id,
      direction,
      zones,
      zoneOrder,
      boardDataSource,
    ).then((data) => {
      if (data) {
        const { zones: updatedZones, zoneOrder: updatedZoneOrder } = data;
        setZones(updatedZones);
        setZoneOrder(updatedZoneOrder);
      }
    });
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
  */

  return (
    <div className="tol-view">
      {/* {editMode && Bar}
      <ZoneModal
        open={open}
        setOpen={setOpen}
        setZones={setZones}
        zones={zones}
        zoneOrder={zoneOrder}
        setZoneOrder={setZoneOrder}
        viewId={id}
        boardDataSource={boardDataSource}
      /> */}
      {/* {view.zones.length > 0 ? (
        <div className="tol-zones">
          {getSortedZones(zones, zoneOrder).map((zone) => {
            return (
              <Zone
                key={zone.id}
                id={zone.id}
                title={zone.title}
                objectType={zone.objectType}
                dataspace={zone.dataspace!}
                filter={zone.filter}
                onZoneReorder={onZoneReorder}
                deleteZone={deleteZone}
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
      )} */}
    </div>
  );
}
