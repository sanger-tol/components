/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import RemoteAggBarChart from "./RemoteAggBarChart";
import { generateDateAgg, generateDateFilterFromBarData, DateInterval } from "./ChartUtils";
import { useState, useEffect } from 'react'


interface Props {
  title: string,
  endpoint: string,
  breakDownBy: string,
  xAxis: string,
  interval: DateInterval,
  type: 'date',

  // 'filter' is usually referred to as globalFilters when using combinedFilters
  filter?: object,
  setCombinedFilters?: React.Dispatch<React.SetStateAction<any>>,

  // config
  height: number,
  stacked?: boolean,
  baseUrl?: string
}

function RemoteBarChart(props: Props) {
  // @ts-ignore
  const { breakDownBy, xAxis, interval, type, filter, setCombinedFilters } = props
  const [ barData, setBarData ] = useState<object>({})

  // these can be swapped for other barchart types (type prop will be used)
  const aggs = generateDateAgg(breakDownBy, xAxis, interval)
  const localFilters = generateDateFilterFromBarData(barData, breakDownBy, xAxis, interval)

  // combine local and globalGilters
  useEffect(() => {
    async function combine() {
      if (setCombinedFilters !== undefined) {
        setCombinedFilters(Object.assign({}, filter, localFilters))
      }
    }
    combine()

  }, [barData])

  // reset localGilters when globalFilters are updated
  useEffect(() => {
    async function resetCombined() {
      if (setCombinedFilters !== undefined) {
        setCombinedFilters(Object.assign({}, filter))
      }
    }
    resetCombined()
  }, [filter])

  // chart does not show pointer if setCombinedFilters undefined
  if (setCombinedFilters == undefined) {
    return (
      <RemoteAggBarChart
        {...props}
        aggs={ aggs }
        filter={ filter }
      />
    )
  } else {
    return (
      <RemoteAggBarChart
        {...props}
        aggs={ aggs }
        filter={ filter }
        setBarData={ setBarData }
      />
    )

  }
}

export default RemoteBarChart;
