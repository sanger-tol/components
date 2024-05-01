/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { 
  Sunburst,
  Widgets
} from '../tol-ui/src';
import { useState } from 'react';


const datasets = {
  "sts_order": [
    {
      "key": "Lepidoptera",
      "value": 184,
      "child": {
        "sts_family": [
          {
            "key": "Noctuidae",
            "value": 149,
            "child": {
              "outer_tester": [
                {
                  "key": "Random1",
                  "value": 20
                },
                {
                  "key": "Random2",
                  "value": 128
                },
                {
                  "key": "Random3",
                  "value": 1
                }
              ]
            }
          },
          {
            "key": "Simpsons",
            "value": 14,
            "child": {
              "outer_tester": [
                {
                  "key": "Random4",
                  "value": 4
                },
                {
                  "key": "Random5",
                  "value": 10
                }
              ]
            }
          },
          {
            "key": "More",
            "value": 21,
            "child": {
              "outer_tester": [
                {
                  "key": "Random6",
                  "value": 7
                },
                {
                  "key": "Random7",
                  "value": 14
                }
              ]
            }
          }
        ]
      }
    },
    {
      "key": "Dippiat",
      "value": 56,
      "child": {
        "sts_family": [
          {
            "key": "Whatever",
            "value": 46,
            "child": {
              "outer_tester": [
                {
                  "key": "Random8",
                  "value": 34
                },
                {
                  "key": "Random9",
                  "value": 12
                }
              ]
            }
          },
          {
            "key": "Happy",
            "value": 10,
            "child": {
              "outer_tester": [
                {
                  "key": "Random10",
                  "value": 4
                },
                {
                  "key": "Random111",
                  "value": 6
                }
              ]
            }
          }
        ]
      }
    }
  ]
};

function Sunbursts() {
  const [sliceData, setSliceData] = useState({});
  const sunburstTitle = "Order of...";

  const basicSunburst = (
    <div>
      <h2>Sunburst</h2>
      <p style={{marginTop: 4}}>This is the &apos;slice&apos; data: {sliceData["bucket"]} {sliceData["clickKey"]} {sliceData["value"]}</p>
      <Sunburst
        id="basic-sunburst"
        title={sunburstTitle}
        datasets={datasets}
        height={800}
        setSliceData={setSliceData}
        legendPosition="left"
      />
    </div>
  );

  const components = [
    {
      component: basicSunburst,
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

export default Sunbursts;
