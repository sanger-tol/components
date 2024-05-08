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
}

function getComponent(componentToAdd, zone) {
  switch (componentToAdd.chartType) {
    case 'Count':
      return <RemoteCount id={componentToAdd.id} title={componentToAdd.id} {...zone} />;
    case 'BarChart':
      return <RemoteBarChart id={componentToAdd.id} title={componentToAdd.id} type='M' breakDownBy='sts_family' stacked xAxis='sts_dna_extracted_date' {...zone} />;
    case 'Table':
      return <RemoteTable id={componentToAdd.id} title={componentToAdd.id} {...zone} />;
    case 'Map':
      return ;
    case 'Sunburst':
      return <RemoteSunburst id={componentToAdd.id} title={componentToAdd.id} sliceBy={["sts_order_group", "sts_family"]} {...zone} />;
  }
}


function ZoneGrid(props: Props) {
  const { id, object_type, widgets } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widgets>(widgets || {components: {}, order: []});
  const [componentToAdd, setComponentToAdd] = useState<ComponentToAdd>();
  const [open, setOpen] = useState(false);

  const speciesZone = useZone({
    endpoint: object_type,
    baseUrl: env.TOL_DATA,
    components: []
  })

  useEffect(() => {
    console.log(currentWidgets)
  }, [currentWidgets]);
  
  useEffect(() => {
    if (componentToAdd) {
      console.log(componentToAdd);
      const component = getComponent(componentToAdd, speciesZone)
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


  function onAddComponent() {
    setOpen(true);
  }

  const moveButton = (
    <Button
      onClick={() => {
        setDraggable(!draggable);
      }}
    >
      Re-arrange
    </Button>
  );

  const addButton = (
    <Button
      onClick={() => {
        onAddComponent();
      }}
    >
      Add
    </Button>
  );
  
  const intro = (
    <Row>
      <Col xs={12} sm={4}>{moveButton}</Col>
      <Col xs={12} sm={4}>{addButton}</Col>
      <Col xs={12} sm={4}>{open && 
        <ComponentModal open={open} setOpen={setOpen} setComponent={setComponentToAdd}/>
      }</Col>
    </Row>
  );

  return (
    <div className='tol-zone'>
      {intro}
      <ResponsiveWidget id={id} widgets={currentWidgets} draggable={draggable} />
    </div>
  );
    
}

export default ZoneGrid;