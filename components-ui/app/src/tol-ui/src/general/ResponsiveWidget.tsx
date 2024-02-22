/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import  GridLayout,{ Layout } from 'react-grid-layout';
import Widgets from './Widgets';

interface Components {
  component: JSX.Element,
  width: number
}

interface Props {
  components: Components[],
  items?: number
  rowheight?: 30
  draggable?: boolean
}

function CalculateHeight(height:number){
  // Add 0.06 as it accounts for the padding added using the widget styling
  if (height){
    return (height/600) + 0.12;
  }else{
    return 1.06;
  }
}

function calculateX(width: number, nextX: number): number[] {
  if ((width+nextX)>4){
    return [0, width];
  }else if((width+nextX) === 4){
    return [nextX, 0];
  }else{
    return [nextX, (width+nextX)];
  }
}

function ResponsiveWidget(props:Props){
  const { components, draggable } = props;

  let pre = 0;
  // @ts-ignore
  const layouts: Layout[] = components.map((component, index) => {
    // xValues contains 2 values, the x cord for the item and the next starting position for the next item (pre)
    const xValues = calculateX(component.width, pre);
    pre = xValues[1];
    return {
      i: `item${index + 1}`,
      x: xValues[0],
      y: index,
      w: component.width,
    };
  });

  return (
    <div>
      <GridLayout
        className="layout"
        layout={layouts}
        cols={4}
        width={window.innerWidth - 9} // Need to adjust for the padding on widgets
        isDraggable={draggable}
        rowHeight={600}
        margin={[18,18]}
      >
        {components.map((component, index)=> {
          const componentToRender = component.component;
          const convertedH = CalculateHeight(componentToRender.props.height);
          layouts[index].h = convertedH;
          return (
            <div key={`item${index+1}`} className='tol-grid-item'>
              <Widgets components={[componentToRender]}/>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}

export default ResponsiveWidget;