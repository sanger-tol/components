/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

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
  RemoteTable
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
  type: string,
  element: JSX.Element
}

interface Widgets {
  components: Record<string, Component>,
  order: string[]
}

interface ComponentToAdd {
  id: string,
  chartType: string,
  chartSize: string
}

interface Props {
  id: string,
  widgets?: Widgets,
  object_type: string,
  onZoneReorder: any,
  deleteZone: any
}

function getComponent(componentToAdd, zone) {
  switch (componentToAdd.chartType) {
  case 'Count':
    return <RemoteCount id={componentToAdd.id} title={componentToAdd.id} {...zone} />;
  case 'BarChart':
    return <RemoteBarChart id={componentToAdd.id} title={componentToAdd.id} type='M' breakDownBy='sts_family' stacked xAxis='sts_dna_extracted_date' {...zone} />;
  case 'Table':
    return <RemoteTable id={componentToAdd.id} title={componentToAdd.id} {...zone} />;
  case 'Sunburst':
    return <RemoteSunburst id={componentToAdd.id} title={componentToAdd.id} sliceBy={["sts_order_group", "sts_family"]} {...zone} />;
  }
}


function ZoneGrid(props: Props) {
  const { id, object_type, widgets, onZoneReorder, deleteZone } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widgets>(widgets || {components: {}, order: []});
  const [componentToAdd, setComponentToAdd] = useState<ComponentToAdd>();
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [open, setOpen] = useState(false);

  const speciesZone = useZone({
    endpoint: object_type,
    baseUrl: env.TOL_DATA,
    components: []
  });

  useEffect(() => {
  }, [currentWidgets]);
  
  useEffect(() => {
    if (componentToAdd) {
      const component = getComponent(componentToAdd, speciesZone);
      setCurrentWidgets({
        // @ts-ignore
        components: {
          ...currentWidgets.components,
          [componentToAdd.id]: {
            type: componentToAdd.chartSize,
            element: component
          }
        },
        order: [...currentWidgets.order, componentToAdd.id]
      });
    }
  }, [componentToAdd]);


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


  function onAddComponent() {
    setOpen(true);
  }

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
          <ComponentModal open={open} setOpen={setOpen} setComponent={setComponentToAdd} />
        </Col>
      </Row>
    </div>
  );

  return (
    <div className='tol-zone'>
      {buttons}
      {currentWidgets.order.length > 0 ?
        <ResponsiveWidget id={id} widgets={currentWidgets} setWidgets={setCurrentWidgets} draggable={draggable} />
        :
        <div className='tol-zone-empty'>
          <p>Click the + button to add a Component</p>
        </div>
      }
    </div>
  );
    
}

export default ZoneGrid;