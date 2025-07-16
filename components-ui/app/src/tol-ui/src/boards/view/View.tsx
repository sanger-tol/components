/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Button,
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
} from "../..";


export interface PView extends PBoard {
  id: string;
  defaultFilter?: IFilter;
  // title: string;
}

export function View(props: PView) {
  const { id, dataSource, boardDataSource } = props;
  const [zones, setZones] = useState<IDBZone[]>([]);
  const [open, setOpen] = useState(false);
  const [zoneOrder, setZoneOrder] = useState<IDBZoneView[]>([]);

  useEffect(() => {
    getZones(id, boardDataSource).then((res: any) => {
      const initialZones = res.zones.map((zone: any) => {
        return {
          id: zone.id,
          objectType: zone.object_type,
          title: zone.title,
          filter: zone.filter,
        };
      });
      setZoneOrder(res.order);
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

  return (
    <div className="tol-view">
      <div className="tol-view-bar">
        <div style={open ? { display: "none" } : {}}>
          <Button
            onClick={() => {
              setOpen(true);
            }}
            type="success"
            className="add-zone-button" // temp placement
            icon="plus"
            position="right"
          />
        </div>
      </div>
      <ZoneModal
        open={open}
        setOpen={setOpen}
        setZones={setZones}
        zones={zones}
        zoneOrder={zoneOrder}
        setZoneOrder={setZoneOrder}
        viewId={id}
        dataSource={dataSource}
        boardDataSource={boardDataSource}
      />
      {zones.length > 0 ? (
        <>
          {getSortedZones(zones, zoneOrder).map((zone) => {
            return (
              <Zone
                key={zone.id}
                id={zone.id}
                title={zone.title}
                objectType={zone.objectType}
                filter={zone.filter}
                onZoneReorder={onZoneReorder}
                deleteZone={deleteZone}
                dataSource={dataSource}
                boardDataSource={boardDataSource}
              />
            );
          })}
        </>
      ) : (
        <div className="tol-zone-empty">
          <p>Click the + button to add a Zone</p>
        </div>
      )}
    </div>
  );
}
