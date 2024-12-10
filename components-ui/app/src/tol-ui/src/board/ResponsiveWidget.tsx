/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { WidthProvider, Responsive, Layouts } from 'react-grid-layout';
import { Button, Placeholder } from '../index';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Zone, getWidgetOrder } from './Utils';
import { resetAllFilters, removeComponent } from '../filtering/Utils';
import {ConfirmationModal}  from '../boardNew/components';

//@ts-nocheck

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
  widgets: Widgets,
  draggable: boolean,
  setWidgets?: any,
  setOrder?: any,
  zone: Zone,
  setZone: any,
  setDraggable: () => void,
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ResponsiveWidget(props: Props) {
  const { widgets, draggable, setOrder, setWidgets, zone, setDraggable } = props;
  const [layoutsState, setLayouts] = useState<Layouts>(generateLayout(widgets));
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const internalLayouts = useRef(generateLayout(widgets));

  useEffect(() => {
    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets]);

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

  const handleDraggable = () => {
    setDraggable();
  }

  function onLayoutChange(layout) {
    //saveToLS("layouts", layouts, id);

    const order = getWidgetOrder(layout, widgets);
    if (setOrder) {
      setOrder(order);
    }
    zone.order = order.order;
    const newLayout = generateLayout(order);

    if (JSON.stringify(newLayout) !== JSON.stringify(layoutsState)) {
      internalLayouts.current = newLayout;
    }
  }

  const onBreakpointChange = () => {
    if (JSON.stringify(internalLayouts.current) !== JSON.stringify(layoutsState)) {
      setLayouts(internalLayouts.current);
    }
  };

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  }

  const confirmationModal = (key) => (
    <ConfirmationModal 
    setOpen={setConfirmationModalOpen} 
    open={confirmationModalOpen}
    onConfirmClick={() => {deleteWidget(key), handleDraggable()}}
    itemType={"widget"}
    
    />
  )

  function generateLayout(components) {
    const types = { 
      small: { lg: { w: 1, h: 1 }, md: { w: 1, h: 1 }, sm: { w: 1, h: 1 } }, 
      medium: { lg: { w: 2, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 1, h: 2 } }, 
      large: { lg: { w: 4, h: 2 }, md: { w: 2, h: 2 }, sm: { w: 1, h: 2 } } 
    };
  
    const layout = { lg: [], md: [], sm: [] };
    const y = { lg: 0, md: 0, sm: 0 };
    const x = { lg: 0, md: 0, sm: 0 };
    
    components.order.forEach((id) => {
      const widget = components.components[id];
      if (!widget) {
        return;
      }
      ['lg', 'md', 'sm'].forEach(breakpoint => {
        const { w, h } = types[widget.size][breakpoint];
      
        // if the widget won't fit on the current row, move it to the next row
        if (x[breakpoint] + w > (breakpoint === 'lg' ? 4 : breakpoint === 'md' ? 2 : 1)) {
          y[breakpoint] += h;
          x[breakpoint] = 0;
        }
      
        layout[breakpoint].push({ i: id, x: x[breakpoint], y: y[breakpoint], w, h });
        x[breakpoint] += w;
      });
    });
    
    return layout;
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
        {widgets.order.map((key)=> {
          // Check if there is a component that matches the ids
          if (!widgets.components[key]) {
            return null;
          }
          if (!draggable) {
            return (
              <div key={key} className='tol-responsive-widget'>
                {widgets.components[key].element}
              </div>
            );
          } else {
            return (
              <div key={key} className='tol-draggable-widget'>
                <Placeholder opacity={0.7} drag message={key}/>
                <Button onClick={() => {
                  handleOpenModal();
                }} variant='danger' className='widget-delete-btn'>
                  <FontAwesomeIcon icon={faTrash} size='sm' />
                </Button>
                {confirmationModal(key)}
              </div>
            );
          }
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
    
}

export default ResponsiveWidget;