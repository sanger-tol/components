/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CentreContents,
  BarChart, 
  RemoteAggBarChart, 
  Button,
  env } from '../tol-ui/src';


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
const d2 = [
  {
    id: 'species_a',
    label: 'Species A',
    data: [100, 200, 300, 400, 11, 600, 143]
  },
  {
    id: 'species_b',
    label: 'Species B',
    data: [100, 200, 300, 153, 500, 11, 56]
  },
  {
    id: 'species_c',
    label: 'Species C',
    data: [100, 200, 300, 400, 500, 600, 700]
  },
  {
    id: 'species_d',
    label: 'Species D',
    data: [100, 133, 100, 400, 100, 44, 10]
  },
  {
    id: 'species_e',
    label: 'Species E',
    data: [100, 133, 100, 500, 200, 44, 100]
  },
  {
    id: 'species_f',
    label: 'Species F',
    data: [100, 133, 100, 100, 200, 44, 100]
  },
  {
    id: 'species_g',
    label: 'Species G',
    data: [100, 133, 100, 100, 200, 44, 100]
  },
  {
    id: 'species_h',
    label: 'Species H',
    data: [100, 133, 100, 100, 200, 44, 100]
  },
  {
    id: 'species_i',
    label: 'Species I',
    data: [100, 133, 100, 100, 200, 44, 100]
  },
  {
    id: 'species_j',
    label: 'Species J',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
  ,
  {
    id: 'species_k',
    label: 'Species K',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
  ,
  {
    id: 'species_l',
    label: 'Species L',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
  ,
  {
    id: 'species_m',
    label: 'Species M',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
  ,
  {
    id: 'species_n',
    label: 'Species N',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
  ,
  {
    id: 'species_o',
    label: 'Species O',
    data: [100, 133, 100, 100, 200, 44, 100]
  }
];

function BarCharts() {
  const [datasets, setDatasests] = useState(d1);
  const [bar, setBar] = useState({});

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
              "field": "mlwh_complete_date",
              "calendar_interval": "1M",
              "time_zone": "Europe/London"
            }
          }
        }
      }
    }
  };
  
  return (
    <div className="charts">
      <CentreContents>
        <h2>Bar Chart</h2>
        <h5>This is the &apos;Bar&apos; data: {bar["bucket"]} {bar["clickKey"]} {bar["value"]}</h5>
        <Button className="m-1" onClick={()=>{
          setDatasests(d1);
        }}>Change d1</Button>
        <Button className="m-1" onClick={()=>{
          setDatasests(d2);
        }}>Change d2</Button>
        <BarChart
          stacked
          title="Interactive monthly comparison of unique species & DNA clusters found per order"
          labels={ labels }
          datasets={ datasets }
          setBarData={ setBar }
          height={ 600 }
        />
        <h2 className="mt-5">Remote Bar Chart</h2>
        <RemoteAggBarChart
          stacked
          title="Run Data"
          endpoint="run_data"
          aggs={ aggs }
          interval="M"
          height={ 600 }
          baseUrl={ env.TOL_DATA }
        />
      </CentreContents>
    </div>
  );
}

export default BarCharts;
