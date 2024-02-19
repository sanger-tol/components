/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from 'react';
import  GridLayout,{ Layout } from 'react-grid-layout';

interface Components {
  component: JSX.Element,
  type: string
}

interface Props {
  title?: string,
  description?: string,
  components: Components[],
  items?: number
  cols?: 4,
  rowheight?: 30
  draggable?: boolean
}
// Could potentially pass components as a key with bar, sunburst, table, filters and count as potential keys that define the size

//function CalculateXPosForWidget(i, prevPosition, setPrev){ //Could use prev x position + sizt to determine where then next component should start from
//  
//}

function ResponsiveWidget(props:Props){
  const { title, description, components, items, cols, rowheight, draggable } = props;
  const [prevX, setPrevX] = useState({});
  const [prevY, setPrevY] = useState({});

  const componentSizeKey = { // Default sizes for the various component types
    'bar-width': 4,
    'bar-height': 2,
    'sunburst-width': 4,
    'sunburst-height': 1,
    'table-width': 4,
    'table-height': 1,
    'count-width': 2,
    'count-height': 0.2
  }

  let totalHeight = 0;
  const rowHeights: number[] = components.map(component => component.component.props.height);
  console.log(rowHeights)
  for (let i=0;i<rowHeights.length;i++){
    if (rowHeights[i]){
      totalHeight = totalHeight + rowHeights[i]
    }
  }

  // Define layouts for different breakpoints
  const layouts: Layout[] = components.map((component, index) => ({
    i: `item${index + 1}`,
    x: (index % 4) * 2,//CalculateXPosForWidget(index, prevX, setPrevX), // Adjust x position based on index
    y: Math.floor(index / 4) * 2, // Adjust y position based on index
    w: componentSizeKey[`${component.type}-width`], // Width of each component
    h: 100 //componentSizeKey[`${component.type}-height`], // Height of each component
  }));


  return (
    <GridLayout
      className="layout"
      layout={layouts}
      cols={4}
      width={window.innerWidth - (window.innerWidth*0.03)}
      isDraggable={draggable}
    >
      {components.map((component, index)=> {
        const ComponentToRender = component.component
        // Can calculate what the item.h value should be in here by setting the default row height as 500 and then divding the component height by 500
        return (
          <div key={`item${index+1}`} className='tol-widget' style={{color: 'blue'}}>
            {ComponentToRender}
          </div>
        )
      })}
    </GridLayout>
  );
};

export default ResponsiveWidget;