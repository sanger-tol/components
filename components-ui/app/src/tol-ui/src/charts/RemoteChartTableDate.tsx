/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import RemoteChartTableFilter from "./RemoteChartTableDateFilter";
import { formatDateRangeWithInterval, DateInterval } from "./ChartUtils";

        
interface Props {
  endpoint: string,
  baseUrl?: string

  // chart specific 
  title: string,
  buckets: string,
  xKey: string,
  stacked?: boolean,
  interval: DateInterval

  // table specific
  fields?: any,
  debug?: boolean,

  // input fields for global filters
  filterInputFields: string[]
}

function RemoteChartTableFilterByDate(props: Props) {
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

  if (bar["bucket"] !== undefined) {
    filter["exact"][buckets] = bar["bucket"]
  }

  // providing a date the range filtering recognizes for month
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
    <div>
      <RemoteChartTableFilter
        {...props}
        aggs={ aggs }
        barClickFilters={ filter }
        setBarData={ setBar }
      />
    </div>
  )
}

export default RemoteChartTableFilterByDate;
