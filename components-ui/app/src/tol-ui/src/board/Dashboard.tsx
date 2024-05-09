/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import {
  ZoneGrid,
  Button,
  ZoneModal
} from '../index';

interface ZoneObject {
  id: string,
  objectType: string
}

interface Props {
  id: string 
}


function Dashboard(props: Props) {
  // @ts-ignore
  const { id } = props;
  const [zones, setZones] = useState<ZoneObject[]>([]);
  const [open, setOpen] = useState(false);
  
  function addZone() {
    console.log('addDashboard');
    setOpen(true);
  }

  const deleteZone = (id: string) => {
    const newZones = zones.filter(zone => zone.id !== id);
    setZones(newZones);
  };

  function onZoneReorder(id: string, direction: string) {
    const index = zones.findIndex(zone => zone.id === id);
    if (index < 0) return; // Zone not found

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= zones.length) return; // New index out of bounds

    const [removed] = zones.splice(index, 1);
    zones.splice(newIndex, 0, removed);

    setZones([...zones]);
  }

  useEffect(() => {
    console.log(zones);
  }, [zones]);

  return (
    <div className='tol-dashboard'>
      <Button onClick={() => {
        addZone();
      }}>Add Zone</Button>
      <ZoneModal open={open} setOpen={setOpen} setZones={setZones} zones={zones}/>
      {zones.map((zone) => {
        console.log(zone);
        return <ZoneGrid
          key={zone.id}
          id={zone.id}
          object_type={zone.objectType}
          onZoneReorder={onZoneReorder}
          deleteZone={deleteZone}
        />;
      })}
    </div>
  );
}

export default Dashboard;