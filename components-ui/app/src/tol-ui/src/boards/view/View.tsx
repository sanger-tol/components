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
  IDBZone,
  IDBZoneView,
  PBoard,
  reorderZoneAndUpsert,
  getSortedZones,
  useBoard,
  TsDataSource,
  UtilityBar,
  BUTTONS,
} from "../..";


export interface PView extends PBoard {
  id: string;
  defaultFilter?: IFilter;
}

export function View(props: PView) {
  const { id, boardDataSource } = props;

  const { editMode, layoutMode } = useBoard();

  const [zones, setZones] = useState<IDBZone[]>([]);
  const [open, setOpen] = useState(false);
  const [zoneOrder, setZoneOrder] = useState<IDBZoneView[]>([]);

  useEffect(() => {
    getZones(id, boardDataSource).then((data: any) => {
      const initialZones = data.zones.map((zone) => {
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
        };
      });
      setZoneOrder(data.order);
      setZones(initialZones);
    });
  }, []);

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

  return (
    <div className="tol-view">
      {editMode && Bar}
      <ZoneModal
        open={open}
        setOpen={setOpen}
        setZones={setZones}
        zones={zones}
        zoneOrder={zoneOrder}
        setZoneOrder={setZoneOrder}
        viewId={id}
        boardDataSource={boardDataSource}
      />
      {zones.length > 0 ? (
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
