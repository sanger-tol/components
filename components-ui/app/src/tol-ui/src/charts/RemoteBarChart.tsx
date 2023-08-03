/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import { httpClient } from '../services/http/httpClient'
import { DateInterval, aggsToChartData } from "./ChartUtils";
import { isPropDefined } from "../general/Utils";
import { Placeholder } from 'rsuite';


interface Props {
  stacked?: boolean,
  endpoint: string,
  baseUrl?: string,
  aggs: object,
  filter?: object,
  title: string,
  interval: DateInterval,
  setBarData?: React.Dispatch<React.SetStateAction<any[]>>
  barDataPoints?: any[]
}

function RemoteBarChart(props: Props) {
  const { endpoint, aggs, interval, filter, baseUrl } = props;
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
        aggs = aggsToChartData(aggs, interval!)
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
      return (
        <div className="tol-bar-chart">
          <Placeholder.Graph active/>
        </div>
      )
    }
    return <div className="tol-bar-chart" />
  }

  return (
    <div>
      <BarChart
        {...props}
        labels={ labels }
        datasets={ datasets }
        delay={1500}
      />
    </div>
  )
}

export default RemoteBarChart;
