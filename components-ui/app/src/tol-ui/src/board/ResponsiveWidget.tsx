/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { WidthProvider, Responsive, Layouts } from 'react-grid-layout';
import { Button, Placeholder } from '../index';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface Component {
  type: string,
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
  setOrder?: any
}

//function getFromLS(key, id) {
//  let ls = {};
//  if (global.localStorage) {
//    try {
//      // @ts-ignore
//      ls = JSON.parse(global.localStorage.getItem(id)) || {};
//    } catch (e) {
//      /*Ignore*/
//    }
//  }
//  return ls[key];
//}

//function saveToLS(key, value, id) {
//  if (global.localStorage) {
//    global.localStorage.setItem(
//      id,
//      JSON.stringify({
//        [key]: value
//      })
//    );
//  }
//}

function getWidgetOrder(layout, widgets) {
  // Sort the layout array by the 'y' property (and 'x' property in case of a tie)
  layout.sort((a, b) => a.y - b.y || a.x - b.x);

  // Map the sorted layout array to an array of widget objects
  const widgetOrder = layout.map(item => item.i);

  return {
    components: widgets['components'],
    order: widgetOrder
  };
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function ResponsiveWidget(props: Props) {
  const { widgets, draggable, setOrder, setWidgets } = props;
  const [layoutsState, setLayouts] = useState<Layouts>(generateLayout(widgets));
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
  };

  function onLayoutChange(layout) {
    //saveToLS("layouts", layouts, id);

    const order = getWidgetOrder(layout, widgets);
    if (setOrder) {
      setOrder(order);
    }
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
      ['lg', 'md', 'sm'].forEach(size => {
        const { w, h } = types[widget.type][size];
      
        // if the widget won't fit on the current row, move it to the next row
        if (x[size] + w > (size === 'lg' ? 4 : size === 'md' ? 2 : 1)) {
          y[size] += h;
          x[size] = 0;
        }
      
        layout[size].push({ i: id, x: x[size], y: y[size], w, h });
        x[size] += w;
      });
    });
    
    return layout;
  }

  //if (!getFromLS('layouts', id)){
  //  ls = generateLayout();
  //} else {
  //  ls = (getFromLS('layouts', id));
  //}

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
                  deleteWidget(key);
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