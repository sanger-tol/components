/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from 'react';
import  GridLayout,{ Layout } from 'react-grid-layout';

interface Components {
  component: JSX.Element,
  width: number
}

interface Props {
  components: Components[],
  items?: number
  cols?: 4,
  rowheight?: 30
  draggable?: boolean
}

function CalculateHeight(height){
  // Add 0.06 as it accounts for the padding added using the widget styling
  if (height){
    return (height/600) + 0.06
  }else{
    return 1.06
  }
}

function ResponsiveWidget(props:Props){
  const { components, draggable } = props;

  let totalHeight = 0;
  const rowHeights: number[] = components.map(component => component.component.props.height);
  for (let i=0;i<rowHeights.length;i++){
    if (rowHeights[i]){
      totalHeight = totalHeight + rowHeights[i]
    }
  }

  // Define layouts for different breakpoints
  const layouts: Layout[] = components.map((component, index) => ({
    i: `item${index + 1}`,
    x: (index * 2) % 4,//CalculateXPosForWidget(index, prevX, setPrevX), // Adjust x position based on index
    y: Math.floor(index / 4) * 2, // Adjust y position based on index
    w: component.width, // Width of each component
  }));

  return (
    <div>
    <GridLayout
      className="layout"
      layout={layouts}
      cols={4}
      width={window.innerWidth - 52} // Need to adjust for the padding on widgets
      isDraggable={draggable}
      rowHeight={600}
      margin={[36,36]}
    >
      {components.map((component, index)=> {
        const componentToRender = component.component
        const convertedH = CalculateHeight(componentToRender.props.height)
        layouts[index].h = convertedH
        return (
          <div key={`item${index+1}`} className='tol-widget'>
            {componentToRender}
          </div>
        )
      })}
    </GridLayout>
    </div>
  );
};

export default ResponsiveWidget;