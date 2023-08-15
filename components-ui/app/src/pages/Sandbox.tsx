/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets, RemoteBarChart, RemoteSunburst } from '../tol-ui/src'


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
}

const c1 = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    aggs={ aggs }
    interval="M"
    height={ 500 }
  />
)

const c2 = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group", "sts_family", "sts_genus"] }
    height={ 500 }
  />
)

function Sandbox() {
  return (
    <div className="sandbox">
      <Widgets
        title="Run Data"
        description="Hello this a test desc..."
        components={[c1, c2, c2, c1]}
      />
    </div>
  );
}

export default Sandbox;