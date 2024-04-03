/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BarChart, 
  RemoteAggBarChart, 
  Widgets,
  env
} from '../tol-ui/src';


// fake data for BarChart component
const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const d1 = [
  {
    id: 'species_1',
    label: 'Species 1',
    data: [100, 10, 300, 340, 500, 200, 200]
  },
  {
    id: 'species_2',
    label: 'Species 2',
    data: [100, 200, 30, 153, 500, 600, 56]
  },
  {
    id: 'species_3',
    label: 'Species 3',
    data: [100, 200, 100, 400, 110, 600, 100]
  }
];

function BarCharts() {
  const [bar, setBar] = useState({});
  const barChartTitle = "Interactive monthly comparison of unique species & DNA clusters found per order";
  const remoteBarChartTitle = "Run Data";

  const aggs = {
    "aggs": {
      "agg": {
        "terms": {
          "field": "mlwh_platform_type.keyword",
          "order": {
            "_count": "desc"
          },
          "size": 25
        },
        "aggs": {
          "1": {
            "date_histogram": {
              "field": "mlwh_run_complete",
              "calendar_interval": "1M",
              "time_zone": "Europe/London"
            }
          }
        }
      }
    }
  };
  
  const basicChart = (
    <div>
      <h2 style={{marginBottom: 4}}>Bar Chart</h2>
      <p style={{marginTop: 4}}>This is the &apos;Bar&apos; data: {bar["bucket"]} {bar["clickKey"]} {bar["value"]}</p>
      <BarChart
        id="basic-stacked"
        stacked
        title={barChartTitle}
        labels={labels}
        datasets={d1}
        setBarData={setBar}
        height={500}
      />
    </div>
  );

  const remoteChart = (
    <div>
      <h2>Remote Bar Chart</h2>
      <RemoteAggBarChart
        id="agg-chart"
        stacked
        title={remoteBarChartTitle}
        endpoint="run_data"
        aggs={aggs}
        interval="M"
        height={500 }
        baseUrl={env.TOL_DATA}
      />
    </div>
  );

  const components = [
    {
      component: basicChart,
      type: 'full'
    },
    {
      component: remoteChart,
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
