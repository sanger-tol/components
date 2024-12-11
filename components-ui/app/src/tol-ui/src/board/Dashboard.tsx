/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from 'react';
import {
  ZoneGrid,
  Button,
  ZoneModal,
  Row,
  Col
} from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';


interface ZoneObject {
  id: string,
  objectType: string
}

interface Props {
  id: string 
}

function Dashboard(props: Props) {
  const { id } = props;
  const {boardId, viewId} = useParams<{boardId: string, viewId: string}>();
  const [zones, setZones] = useState<ZoneObject[]>([]);
  const [open, setOpen] = useState(false);
  
  function addZone() {
    setOpen(true);
  }

  //TODO Remove after testing
  useEffect(() => {
    console.log("Board ID:", boardId);
    console.log("View ID:", viewId);
  }, [boardId, viewId]);

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

  const addButton = (
    <Button
      onClick={() => {
        addZone();
      }}
      variant='success'
      className='zone-config-button'
    >
      <FontAwesomeIcon icon={faPlus} size='sm' />
    </Button>
  );

  const buttons = (
    <div className='tol-dashboard-bar'>
      <Row>
        <Col>
          <h5>
            {id}
            {addButton}
          </h5>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className='tol-dashboard'>
      {buttons}
      <ZoneModal open={open} setOpen={setOpen} setZones={setZones} zones={zones}/>
      {zones.length > 0 ?
        <>
          {zones.map((zone) => {
            return <ZoneGrid
              key={zone.id}
              id={zone.id}
              objectType={zone.objectType}
              onZoneReorder={onZoneReorder}
              deleteZone={deleteZone}
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

export default Dashboard;