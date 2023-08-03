/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents, Sunburst } from '../tol-ui/src'

function Sunbursts() {
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
              "key": "Other",
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
  }

  return (
    <div className="sunbursts">
      <CentreContents>
        <Sunburst
          title="Order of ..."
          datasets={datasets}
          height={800}
        />
      </CentreContents>
    </div>
  );
}

export default Sunbursts;