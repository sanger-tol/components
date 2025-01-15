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
  saveLayout: boolean,
  setSaveLayout: any,
  ds: any
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ResponsiveWidget(props: Props) {
  const { widgets, setWidgets, draggable, zone, setZone, saveLayout, setSaveLayout, ds } = props;
  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);
  const internalLayouts = useRef(generateLayout(widgets));

  useEffect(() => {
    // Generating the visualisations from the widgets
    const elementsFromWidgets = widgets.map((widget) => {
      const visualisation: JSX.Element = (
        /* @ts-ignore */
        <Visualisation
        id={widget.componentId}
        zone={zone}
        setZone={setZone}
        setWidgetType={setWidgetType}
      />
      );
      return (
        <div key={widget.componentId} className='tol-responsive-widget'>
          {visualisation || null}
        </div>
      );
    });
    setElements(elementsFromWidgets);

    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets, zone]);

  const setWidgetType = (id: string, widgetType: string) => {
    const newWidgets = widgets.map(widget => {
      if (widget.componentId === id) {
        widget.componentType = widgetType;
      }
      return widget;
    });
    setWidgets(newWidgets);
  }

  const deleteWidget = (id: string) => {
    const newWidgets = widgets.filter(widget => widget.componentId !== id);
    ds.custom(
      `boards/component/${id}`,
      'DELETE',
    )
    setWidgets(newWidgets);
  };

  useEffect(() => {
    if (saveLayout) {
      onLayoutSave(newLayout)
    }
  }, [saveLayout]);

  const onLayoutSave = async(layout) => {
    // Gets the order based off of the layout on screen
    const order = getWidgetOrder(layout);

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

  const handleOpenModal = (key: string) => {
    setWidgetToDelete(key);
    setConfirmationModalOpen(true);
  }

  // @ts-ignore
  const confirmationModal = () => (
    <ConfirmationModal 
      setOpen={setConfirmationModalOpen} 
      open={confirmationModalOpen}
      // @ts-ignore
      onConfirmClick={handleConfirmDeleteComponent}
      itemType={"widget"}
    />
  )

  const handleConfirmDeleteComponent = () => {
    if (widgetToDelete) {
      deleteWidget(widgetToDelete);
      setWidgetToDelete(null);
    }
    setConfirmationModalOpen(false);
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
              <div className='tol-draggable-widget' key={element.props.children.props.id}>
                <Placeholder opacity={0.7} drag message={element.props.children.props.id}/>
                <Button onClick={() => {
                  handleOpenModal(element.props.children.props.id);
                }} variant='danger' className='widget-delete-btn'>
                  <FontAwesomeIcon icon={faTrash} size='sm'/>
                </Button>
                {confirmationModal()}
              </div>
            );
          }
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
    
}

export default ResponsiveWidget;