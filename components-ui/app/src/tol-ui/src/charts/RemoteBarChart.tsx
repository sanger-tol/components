/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import { httpClient } from '../services/http/httpClient'
import { DateInterval, aggsToBarChartData } from "./ChartUtils";
import { isPropDefined } from "../general/Utils";
import Placeholder from "../general/Placeholder";


interface Props {
  stacked?: boolean,
  endpoint: string,
  baseUrl?: string,
  aggs: object,
  filter?: object,
  title: string,
  interval: DateInterval,
  height: number,
  setBarData?: React.Dispatch<React.SetStateAction<any>>
}

function RemoteBarChart(props: Props) {
  const { endpoint, aggs, interval, filter, baseUrl, height } = props;
  const [labels, setLabels] = useState([])
  const [datasets, setDatasets] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    })
    .then((res: any) => {
      let aggs = res.data.meta.aggregations
      // check if a datetime chart
      if (isPropDefined(interval)) {
        aggs = aggsToBarChartData(aggs, interval!)
        setDatasets(aggs.datasets)
        setLabels(aggs.labels)
        setLoading(false)
        setInitialLoad(false)
      } else {
        throw Error("interval prop currently needs to be set")
      }
    })
    .catch((error: any) => {
      console.error(error.message)
    })
  }, [filter]);
  
  if (loading) {
    if (initialLoad) {
      return <Placeholder height={height} />
    }
    return <Placeholder empty height={height} />
  }

  return (
    <BarChart
      {...props}
      labels={ labels }
      datasets={ datasets }
      delay={1000}
    />
  )
}

export default RemoteBarChart;
