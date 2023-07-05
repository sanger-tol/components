/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import RemoteChartTable from "./RemoteChartTable";
import { formatDateRangeWithInterval, DateInterval } from "./ChartUtils";

        
interface Props {
  stacked?: boolean,
  title: string,
  endpoint: string,
  buckets: string,
  xKey: string,
  interval: DateInterval,
  fields?: any,
  debug?: boolean
}

function RemoteDateChartTable(props: Props) {
  const { buckets, xKey, interval } = props
  const [bar, setBar] = useState({})
 
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
  filter["exact"][buckets] = bar["bucket"]

  // providing a date the range filtering recognizes
  let barXKey = bar["xKey"]
  if (interval === "M") {
    barXKey = "01 " + barXKey
  }
  // formatting the date range for filtering
  const dateRange = formatDateRangeWithInterval(barXKey, interval)
  if (dateRange) {
    filter["range"][xKey] = dateRange
  }

  return (
    <RemoteChartTable
      {...props}
      aggs={ aggs }
      tableFilter={ filter }
      setBarData={ setBar }
    />
  )
}

export default RemoteDateChartTable;
