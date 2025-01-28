/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BarChart, 
  Widgets
} from '../tol-ui/src';


// fake data for BarChart component
const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const d1 = [
  {
    id: 'species_1',
    label: 'Species 1',
    data: [3, 10, 2, 6, 4, 3, 1],
    type: 'line'
  },
  {
    id: 'species_2',
    label: 'Species 2',
    data: [100, 200, 30, 153, 500, 600, 56],
    type: 'line'
  },
  {
    id: 'species_3',
    label: 'Species 3',
    data: [100, 200, 100, 400, 110, 600, 100],
    type: 'bar'
  }
];

function BarCharts() {
  const [bar, setBar] = useState({});
  
  const basicChart = (
    <div>
      <h2 style={{marginBottom: 4}}>Bar Chart</h2>
      <p style={{marginTop: 4}}>This is the &apos;Bar&apos; data: {bar["bucket"]} {bar["clickKey"]} {bar["value"]}</p>
      <BarChart
        id="basic-stacked"
        title="Basic Stacked Bar Chart"
        labels={labels}
        datasets={d1}
        setBarData={setBar}
        height={500}
      />
    </div>
  );

  const components = [
    {
      component: basicChart,
      type: 'full'
    }
  ];

  return (
    <div className="barcharts">
      <Widgets
        components={components}
      />
    </div>
  );
}

export default BarCharts;
