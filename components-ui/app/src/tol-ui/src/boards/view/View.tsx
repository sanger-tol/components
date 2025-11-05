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
  PUtilityBar,
  UtilityBar,
  PButton,
  PRIVILEGE,
  useBoardPrivilege,
  IDataspaceMeta,
  TsDataSource,
} from "../..";


export interface PView extends PBoard {
  // extends but excludes setPrivilege
  id: string;
  defaultFilter?: IFilter;
  utilityBarConfig?: PUtilityBar
  // title: string;
}

export function View(props: PView) {
  const { id, boardDataSource, utilityBarConfig } = props;
  const [zones, setZones] = useState<IDBZone[]>([]);
  const [open, setOpen] = useState(false);
  const [zoneOrder, setZoneOrder] = useState<IDBZoneView[]>([]);
  const { privilege } = useBoardPrivilege();

  useEffect(() => {
    getZones(id, boardDataSource).then((data: any) => {
      const initialZones = data.zones.map((zone) => {
        const apiDetails = zone.relationships.data_source_instance.api_details;

        return {
          id: zone.id,
          objectType: zone.object_type,
          title: zone.title,
          filter: zone.filter,
          dataspaceMeta: {
            dataSourceInstanceId: 1,
            dataspace: new TsDataSource({
              url: apiDetails.url,
              apiPath: apiDetails.api_path,
              apiDataPath: apiDetails.api_data_path,
              dataspace: apiDetails.dataspace,
            }),
            apiDetails: apiDetails,
          },
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

  const addZoneButton: PButton = {
    type: "success",
    className: "add-zone-button", // temp placement
    testid: "add-zone-button",
    icon: "plus",
    position: "right",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
    onClick: () => {
      setOpen(true);
    },
  }

  return (
    <div className="tol-view">
      <div className="tol-view-bar">
        <UtilityBar
          id={utilityBarConfig?.id}
          buttons={[addZoneButton, ...(utilityBarConfig?.buttons || [])]}
          title={utilityBarConfig?.title}
        />
      </div>
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
                dataspaceMeta={zone.dataspaceMeta}
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
          {privilege === PRIVILEGE.BOARD.EDITABLE ? (
            <p>Click the + button to add a Zone</p>
          ) : (
            <p>No zones found</p>
          )}
        </div>
      )}
    </div>
  );
}
