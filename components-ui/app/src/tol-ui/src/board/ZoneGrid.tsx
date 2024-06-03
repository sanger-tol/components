/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Button, 
  useZone, 
  ResponsiveWidget, 
  env, 
  RemoteCount, 
  ComponentModal,
  RemoteBarChart,
  RemoteSunburst,
  RemoteTable,
  useEffectUpdate
} from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPlus,
  faArrowUp,
  faArrowDown,
  faPenToSquare
} from '@fortawesome/free-solid-svg-icons';


interface Component {
  size: string,
  element: JSX.Element
}

interface Widgets {
  components: Record<string, Component>,
  order: string[]
}

interface Props {
  id: string,
  widgets?: Widgets,
  objectType: string,
  onZoneReorder: any,
  deleteZone: any
}

function ZoneGrid(props: Props) {
  const { id, objectType, widgets, onZoneReorder, deleteZone } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widgets>(widgets || {components: {}, order: []});
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [open, setOpen] = useState(false);
  const z = useZone({
    endpoint: objectType,
    baseUrl: env.TOL_DATA,
    components: []
  });

  const getComponent = (id: string, type: string, props: any) => {
    switch (type) {
    case 'count':
      return (
        <RemoteCount
          {...props}
          id={id}
          title={id}
        />
      );
    case 'barchart':
      return (
        <RemoteBarChart
          {...props}
          id={id}
          title={id}
          stacked

          // temporary static
          type='M'
          breakDownBy='sts_family'
          xAxis='sts_dna_extracted_date' />
      );
    case 'table':
      return (
        <RemoteTable
          {...props}
          id={id}
        />
      );
    case 'sunburst':
      return (
        <RemoteSunburst
          {...props}
          id={id}
          title={id}

          // temporary static
          sliceBy={["sts_order_group", "sts_family"]}
        />
      );
    }
  };

  const getWidgetsUsingZone = () => {
    const newWidgets = {components: {}, order: [] as string[]};
    for (const [id, component] of Object.entries(z.zone.components)) {
      newWidgets.components[id] = {
        size: component.data.size,
        element: getComponent(id, component.data.type!, z)
      };
    }
    newWidgets.order = z.zone.order;
    return newWidgets;
  };

  useEffectUpdate(() => {
    setCurrentWidgets(getWidgetsUsingZone());
  }, [z.zone]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.target.closest('.tol-delete-warning')) {
        return;
      }
      setDeleteWarning(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);


  const onAddComponent = () => {
    setOpen(true);
  };

  const editButton = (
    <Button
      onClick={() => {
        setDraggable(!draggable);
      }}
      className='zone-edit-button'
    >
      <FontAwesomeIcon icon={faPenToSquare} size="sm" />
    </Button>
  );

  const addButton = (
    <Button
      onClick={() => {
        onAddComponent();
      }}
      className='zone-config-button'
      variant="success"
    >
      <FontAwesomeIcon icon={faPlus} size="sm" />
    </Button>
  );

  const deleteButton = (
    <Button
      onClick={() => {
        if (!deleteWarning) {
          setDeleteWarning(true);
          return;
        }
        deleteZone(id);
      }}
      className={deleteWarning ? 'tol-delete-warning' : 'zone-config-button'}
      variant="danger"
    >
      {!deleteWarning ? 
        <FontAwesomeIcon icon={faTrash} size="sm" />
        :
        <p>Are you sure?</p>
      }
    </Button>
  );

  const upButton = (
    <Button
      onClick={() => {
        onZoneReorder(id, 'up');
      }}
      className='zone-config-button'
    >
      <FontAwesomeIcon icon={faArrowUp} size="sm" />
    </Button>
  );
  
  const downButton = (
    <Button
      onClick={() => {
        onZoneReorder(id, 'down');
      }}
      className='zone-config-button'
    >
      <FontAwesomeIcon icon={faArrowDown} size="sm" />
    </Button>
  );

  const buttons = (
    <div className='tol-zone-bar'>
      <Row>
        <Col>
          <h6>
            {id}
            {deleteButton}
            {addButton}
            {editButton}
            {downButton}
            {upButton}
          </h6>
          <ComponentModal open={open} setOpen={setOpen} {...z} />
        </Col>
      </Row>
    </div>
  );

  return (
    <div className='tol-zone'>
      {buttons}
      {currentWidgets.order.length > 0 ?
        <ResponsiveWidget
          id={id}
          widgets={currentWidgets}
          setWidgets={setCurrentWidgets}
          draggable={draggable}
          zone={z.zone}
          setZone={z.setZone}
        />
        :
        <div className='tol-zone-empty'>
          <p>Click the + button to add a Component</p>
        </div>
      }
    </div>
  );
    
}

export default ZoneGrid;