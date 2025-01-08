/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import {
  ZoneGrid,
  Button,
  ZoneModal,
  IFilter
} from '../index';
import { getZones } from "./Utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


interface ZoneObject {
  id: string,
  objectType: string,
  title: string
}

interface OrderObject {
  zoneId: string,
  order: number,
  zoneViewId: string
}

interface Props {
  id: string,
  // title: string,
  ds: any,
  defaultFilter?: IFilter
}

function View(props: Props) {
  const { id, ds } = props;
  const [zones, setZones] = useState<ZoneObject[]>([]);
  const [open, setOpen] = useState(false);
  const [zoneOrder, setZoneOrder] = useState<OrderObject[]>([]);
  
  useEffect(() => {
    getZones(id, ds).then((res: any) => {
      const initialZones = res.zones.map((zone: any) => {
        return {
          id: zone.id,
          objectType: zone.object_type,
          title: zone.title
        };
      });
      setZoneOrder(res.order);
      setZones(initialZones);
    });
  }, []);

  const deleteZone = (id: string) => {
    const newZones = zones.filter(zone => zone.id !== id);
    ds.custom(
      `boards/zone/${id}`,
      'DELETE',
    )
    setZones(newZones);
  };

  const onZoneReorder = async (id: string, direction: string) => {
    // Sort a copy of zoneOrder array by order
    const updatedZoneOrder = [...zoneOrder]
    updatedZoneOrder.sort((a, b) => a.order - b.order);

    // Find the index of the zone order to move
    const moverIndex = updatedZoneOrder.findIndex(zone => zone.zoneId === id);
  
    const delta = direction === 'up' ? -1 : 1;

    // Find the zone order to move and the zone order to move it to
    const mover = updatedZoneOrder[moverIndex];
    const moved = updatedZoneOrder[moverIndex + delta];

    // Bounds check
    if (!moved) return;
    
    // Swap the order values
    const oldMoverOrder = mover.order;
    const oldMovedOrder = moved.order;

    mover.order = oldMovedOrder;
    moved.order = oldMoverOrder;

    // Sort again
    updatedZoneOrder.sort((a, b) => a.order - b.order);
    
    // Get the maximum order value
    const orders = updatedZoneOrder.map((zone) => {
      return zone.order
    })
    const maxOrder = Math.max(...orders);

    // Add the max offset value to each zone order (This avoids integrity issues in the DB) 
    updatedZoneOrder.forEach((zone) => {
      zone.order += maxOrder + 1;
    });
    
    const payloadData = updatedZoneOrder.map((zone) => {
      return {
        type: 'zone_view',
        id: zone.zoneViewId,
        attributes: {
          order: zone.order
        }
      }
    })

    await ds.upsert({
      objectType: 'zone_view',
      payload: payloadData
    })

    setZoneOrder(updatedZoneOrder);

    // Reorder the zones state based on the updated zoneOrder
    const updatedZones = [...zones].sort((a, b) => {
      // @ts-ignore
      const orderA = updatedZoneOrder.find(zone => zone.id === a.id)?.order || 0;
      // @ts-ignore
      const orderB = updatedZoneOrder.find(zone => zone.id === b.id)?.order || 0;
      return orderA - orderB;
    });
  
    setZones(updatedZones);
  }

  const addButton = (
    <Button
      onClick={() => {
        setOpen(true)
      }}
      variant='success'
      className='add-zone-button' // temp placement
      style={open ? {display: "none"} : {}} // to hide strange placement
    >
      <FontAwesomeIcon icon={faPlus} size='sm' />
    </Button>
  );

  const getSortedZones = () => {
    return [...zones].sort((a, b) => {
      const orderA = zoneOrder.find(zone => zone.zoneId === a.id)?.order || 0;
      const orderB = zoneOrder.find(zone => zone.zoneId === b.id)?.order || 0;
      return orderA - orderB;
    });
  };

  return (
    <div className='tol-view'>
      <div className='tol-view-bar'>
      {addButton}
      </div>
      <ZoneModal
        open={open}
        setOpen={setOpen}
        setZones={setZones}
        zones={zones}
        zoneOrder={zoneOrder}
        setZoneOrder={setZoneOrder}
        ds={ds}
        viewId={id}
      />
      {zones.length > 0 ?
        <>
          {getSortedZones().map((zone) => {
            return <ZoneGrid
              key={zone.id}
              id={zone.id}
              title={zone.title}
              objectType={zone.objectType}
              onZoneReorder={onZoneReorder}
              deleteZone={deleteZone}
              ds={ds}
            />;
          })}
        </>
        :
        <div className='tol-zone-empty'>
          <p>Click the + button to add a Zone</p>
        </div>
      }
    </div>
  );
}

export default View;