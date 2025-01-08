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
  zone: Zone,
  setZone: any,
  setDraggable: () => void,
  saveLayout: boolean,
  setSaveLayout: any,
  ds: any
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ResponsiveWidget(props: Props) {
  const { widgets, setWidgets, draggable, zone, setZone, setDraggable, saveLayout, setSaveLayout, ds } = props;
  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const internalLayouts = useRef(generateLayout(widgets));

  const handleDraggable = () => {
    setDraggable();
  }

  useEffect(() => {
    // Generating the visualisations from the widgets
    const elementsFromWidgets = widgets.map((widget) => {
      return (
        <div key={widget.componentId} className='tol-responsive-widget'>
          <Visualisation
            id={widget.componentId}
            zone={zone}
            setZone={setZone}
            setWidgetType={setWidgetType}
          />
        </div>
      )
    })
    setElements(elementsFromWidgets);

    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets]);

  const setWidgetType = (id: string, widgetType: string) => {
    const newWidgets = widgets.map(widget => {
      if (widget.componentId === id) {
        widget.componentType = widgetType;
      }
      return widget;
    });
    setWidgets(newWidgets);
  }

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

  useEffect(() => {
    if (saveLayout) {
      onLayoutSave(newLayout)
    }
  }, [saveLayout]);

  const onLayoutSave = async(layout) => {
    // Gets the order based off of the layout on screen
    const order = getWidgetOrder(layout, widgets);

    // Finds the highest order value in the current widgets, based off the db
    const orderValues = widgets.map(widget => Number(widget.order))
    const highestPreviousOrder = Math.max(...orderValues);
    
    // Maps through the order and upserts based off of the componentId
    const payloadData = order.order.map((componentId, index) => {
      const widget = widgets.find(widget => widget.componentId === componentId);
      widget!.order = highestPreviousOrder + 1 + index;
      return {
        type: 'component_zone',
        id: widget!.componentZoneId,
        attributes: {
          order: highestPreviousOrder + index + 1
        }
      };
    });
    await ds.upsert({
      objectType: 'component_zone',
      payload: payloadData
    })
    setSaveLayout(false);
    zone.order = order.order;
    setWidgets(widgets)
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

  return (
    <div className='tol-responsive-grid'>
      <ResponsiveReactGridLayout
        layouts={layoutsState}
        breakpoints={{ lg: 992, md: 576, sm: 0 }}
        cols={{lg: 4, md: 2, sm: 1}}
        isDraggable={draggable}
        compactType='vertical'
        rowHeight={150}
        onLayoutChange={(layout: any) => setNewLayout(layout)}
        onBreakpointChange={onBreakpointChange}
        draggableCancel='.widget-delete-btn'
      >
        {elements.map((element)=> {
          // Check if there is a component that matches the ids
          if (!draggable) {
            return element;
          } else {
            return (
              <div className='tol-draggable-widget'>
                <Placeholder opacity={0.7} drag message={element.props.children.props.id}/>
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