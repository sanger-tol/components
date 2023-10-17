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
  title?: string,
  interval: DateInterval,
  height: number,
  shortDate?: boolean,
  setBarData?: React.Dispatch<React.SetStateAction<any>>
}

function RemoteAggBarChart(props: Props) {
  const { endpoint, aggs, interval, filter, baseUrl, height, shortDate } = props;
  const [labels, setLabels] = useState([])
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    })
    .then((res: any) => {
      setErrorMessage('')
      let aggs = res.data.meta.aggregations
      // check if a datetime chart
      if (isPropDefined(interval)) {
        aggs = aggsToBarChartData(aggs, interval!, shortDate)
        setDatasets(aggs.datasets)
        setLabels(aggs.labels)
        setLoading(false)
      } else {
        throw Error("interval prop currently needs to be set")
      }
    })
    .catch((error: any) => {
      console.error(error.message)
      setErrorMessage(error.message)
    })
  }, [filter]);

  if (errorMessage !== ''){
    return (
        <Placeholder
            errorMessage={errorMessage}
            height={height}
        />
    );
  }
  
  if (loading) {
    return <Placeholder bar height={height} />
  }

  return (
    <BarChart
      {...props}
      labels={ labels }
      datasets={ datasets }
    />
  )
}

export default RemoteAggBarChart;
