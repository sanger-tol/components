/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Widgets from "./Widgets";
import  GridLayout,{ Layout } from 'react-grid-layout';


interface Props {
  title?: string,
  description?: string,
  components: JSX.Element[],
  items?: number
  cols?: 4,
  rowheight?: 30
}

function ResponsiveWidget(props:Props){
    const { title, description, components, items, cols, rowheight } = props;
    //const [layout, setLayout] = useState({});

    // Define layouts for different breakpoints
    const layout: Layout[] = [
      { i: 'item1', x: 0, y: 0, w: 1, h: 0 },
    ];

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={4}
      rowHeight={100}
      width={1200}
    >
      {/* Grid items go here */}
      <div key="item1"><Widgets components={[components[0]]}/></div>
    </GridLayout>
  );
};

export default ResponsiveWidget;