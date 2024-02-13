/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { getCssVarValue, isPropDefined } from "./Utils";
import { Responsive, WidthProvider } from 'react-grid-layout';


interface Props {
  title?: string,
  description?: string,
  components?: JSX.Element[],
  items?: number
  cols?: 4,
  rowheight?: 30
}

function ResponsiveWidget(props:Props){
    //const { title, description, components, items, cols, rowheight } = props;
    //const [layout, setLayout] = useState({});

    const ResponsiveGridLayout = WidthProvider(Responsive);

    // Define layouts for different breakpoints
  const layouts = {
    lg: [
      { i: 'item1', x: 0, y: 0, w: 2, h: 2 },
      { i: 'item2', x: 2, y: 0, w: 1, h: 1 },
      { i: 'item3', x: 0, y: 2, w: 3, h: 1 },
    ],
    md: [
      { i: 'item1', x: 0, y: 0, w: 2, h: 2 },
      { i: 'item2', x: 2, y: 0, w: 1, h: 1 },
      { i: 'item3', x: 0, y: 2, w: 2, h: 1 },
    ],
    sm: [
      { i: 'item1', x: 0, y: 0, w: 1, h: 2 },
      { i: 'item2', x: 1, y: 0, w: 1, h: 1 },
      { i: 'item3', x: 0, y: 1, w: 2, h: 1 },
    ],
    xs: [
      { i: 'item1', x: 0, y: 0, w: 1, h: 2 },
      { i: 'item2', x: 0, y: 1, w: 1, h: 1 },
      { i: 'item3', x: 0, y: 2, w: 1, h: 1 },
    ],
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 3, md: 3, sm: 2, xs: 1, xxs: 1 }}
      rowHeight={100}
      width={1200}
    >
      {/* Grid items go here */}
      <div key="item1">Item 1</div>
      <div key="item2">Item 2</div>
      <div key="item3">Item 3</div>
    </ResponsiveGridLayout>
  );
};

export default ResponsiveWidget;