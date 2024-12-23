/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { WidthProvider, Responsive, Layouts } from 'react-grid-layout';
import { Button, Placeholder, Visualisation } from '../index';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Zone, getWidgetOrder, generateLayout } from './Utils';
import { ConfirmationModal } from './components';

interface Widgets {
  componentId: string,
  order: string,
  componentZoneId: string
  componentType: string
}

interface Props {
  id: string,
  widgets: Widgets[],
  draggable: boolean,
  setWidgets?: any,
  setOrder?: any,
  zone: Zone,
  setZone: any,
  setDraggable: () => void
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ResponsiveWidget(props: Props) {
  const { widgets, draggable, setOrder, zone, setZone, setDraggable } = props;
  const [layoutsState, setLayouts] = useState<Layouts>(generateLayout(widgets));
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const internalLayouts = useRef(generateLayout(widgets));
  //console.log(zone)

  const handleDraggable = () => {
    setDraggable();
  }

  useEffect(() => {
    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets]);

  /* THIS WILL NEED REPLACING WHEN CUSTOM ENDPOINTS ARE FINISHED
  const deleteWidget = (id: string) => {
    const newComponents = Object.keys(widgets.components)
      .filter(key => key !== id)
      .reduce((obj, key) => {
        obj[key] = widgets.components[key];
        return obj;
      }, {});
    const newOrder = widgets.order.filter(key => key !== id);
    setWidgets({ components: newComponents, order: newOrder });
    // Going to have to make it remove it from the zone and then set the zone again to fire off the useEffect in the ZoneGrid
    removeComponent(id, zone);
    resetAllFilters(zone);
  };
   */

  // This function needs adapting slightly, taking in widgets rather than order
  // Also needs to account for the way order is stored in the DB
  function onLayoutChange(layout) {

    const order = getWidgetOrder(layout, widgets);
    if (setOrder) {
      setOrder(order);
    }
    zone.order = order.order;
    //const newLayout = generateLayout(order);

    //if (JSON.stringify(newLayout) !== JSON.stringify(layoutsState)) {
    //  internalLayouts.current = newLayout;
    //}
  }

  const onBreakpointChange = () => {
    if (JSON.stringify(internalLayouts.current) !== JSON.stringify(layoutsState)) {
      setLayouts(internalLayouts.current);
    }
  };

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  }

  // @ts-ignore
  const confirmationModal = (key: string) => (
    <ConfirmationModal 
      setOpen={setConfirmationModalOpen} 
      open={confirmationModalOpen}
      // @ts-ignore
      onConfirmClick={() => {deleteWidget(key), handleDraggable()}}
      itemType={"widget"}
    />
  )

  // @ts-ignore
  const setWidgetType = (componentId: string, widgetType: string) => {
    //console.log(layoutsState);
  }

  return (
    <div className='tol-responsive-grid'>
      <ResponsiveReactGridLayout
        layouts={layoutsState}
        breakpoints={{ lg: 992, md: 576, sm: 0 }}
        cols={{lg: 4, md: 2, sm: 1}}
        isDraggable={draggable}
        compactType='vertical'
        rowHeight={150}
        onLayoutChange={onLayoutChange}
        onBreakpointChange={onBreakpointChange}
        draggableCancel='.widget-delete-btn'
      >
        {widgets.map((key)=> {
          // Check if there is a component that matches the ids
          const id = key.componentId;
          if (!draggable) {
            return (
              <div key={id} className='tol-responsive-widget'>
                <Visualisation
                  id={id}
                  zone={zone}
                  setZone={setZone}
                  setWidgetType={setWidgetType}
                />
              </div>
            );
          } else {
            return (
              <div key={id} className='tol-draggable-widget'>
                <Placeholder opacity={0.7} drag message={id}/>
                <Button onClick={() => {
                  handleOpenModal();
                }} variant='danger' className='widget-delete-btn'>
                  <FontAwesomeIcon icon={faTrash} size='sm'/>
                </Button>
              </div>
            );
          }
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
    
}

export default ResponsiveWidget;