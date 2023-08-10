/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import RemoteChartTable from "./RemoteChartTable";
import { formatDateRangeWithInterval, DateInterval } from "./ChartUtils";

        
interface Props {
  title: string,
  endpoint: string,
  buckets: string,
  xKey: string,
  interval: DateInterval,
  filterInputFields: string[],
  fields?: any,
  debug?: boolean
  stacked?: boolean,
  baseUrl?: string,
}

function RemoteDateChartTable(props: Props) {
  const { buckets, xKey, interval } = props
  const [bar, setBar] = useState<any[]>([])

  // datetime aggregation
  const aggs = {
    "aggs": {
      "agg": {
        "terms": {
          "field": buckets + ".keyword",
          "order": {
            "_count": "desc"
          },
          "size": 50
        },
        "aggs": {
          "1": {
            "date_histogram": {
              "field": xKey,
              "calendar_interval": "1" + interval,
              "time_zone": "Europe/London"
            }
          }
        }
      }
    }
  }

  const filter = {
    "exact": {},
    "range": {}
  }

  // if there's a selected bar with a bucket, filter["exact"] 
  // should be populated with the selected bucket
  if (bar.length > 0) {
    filter["exact"][buckets] = bar[0]["bucket"]
  }

  // providing a date the range filtering recognizes for month
  if (bar.length > 0) {
    let barXKey = bar[0]["xKey"]
    if (interval === "M") {
      barXKey = "01 " + barXKey
    }
    // formatting the date range for filtering
    const dateRange = formatDateRangeWithInterval(barXKey, interval)
    if (dateRange) {
      filter["range"][xKey] = dateRange
    }
  }

  return (
    <div>
      <RemoteChartTable
        {...props}
        aggs={ aggs }
        filter={ filter }
        setBarData={ setBar }
      />
    </div>
  )
}

export default RemoteDateChartTable;
