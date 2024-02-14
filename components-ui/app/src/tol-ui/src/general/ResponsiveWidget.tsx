/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import Widgets from "./Widgets";
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
  rowheight?: 100
}
// Could potentially pass components as a key with bar, sunburst, table, filters and count as potential keys that define the size

//function CalculateXPosForWidget(i, prevPosition, setPrev){ //Could use prev x position + sizt to determine where then next component should start from
//  
//}

function ResponsiveWidget(props:Props){
  const { title, description, components, items, cols, rowheight } = props;
  const [prevX, setPrevX] = useState({});
  const [prevY, setPrevY] = useState({});

  const componentSizeKey = { // Default sizes for the various component types
    'bar-width': 4,
    'bar-height': 3,
    'sunburst-width': 4,
    'sunburst-height': 4,
    'table-width': 4,
    'table-height': 4
  }

  components.map((component) => {
    console.log(componentSizeKey[`${component.type}-width`])
    console.log(componentSizeKey[`${component.type}-height`])
  })

  // Define layouts for different breakpoints
  const layouts: Layout[] = components.map((component, index) => ({
    i: `item${index + 1}`,
    x: (index % 4) * 2,//CalculateXPosForWidget(index, prevX, setPrevX), // Adjust x position based on index
    y: Math.floor(index / 4) * 2, // Adjust y position based on index
    w: componentSizeKey[`${component.type}-width`], // Width of each component
    h: componentSizeKey[`${component.type}-height`], // Height of each component
  }));


  return (
    <GridLayout
      className="layout"
      layout={layouts}
      cols={4}
      rowHeight={200}
      width={1200}
    >
      {components.map((component, index)=> {
        console.log(component.component)
        const componentToRender = component.component
        return (
          <div key={`item${index+1}`}><componentToRender/></div>
        )
      })}
    </GridLayout>
  );
};

export default ResponsiveWidget;