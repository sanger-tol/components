/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import { httpClient } from '../services/http/httpClient'
import { DateInterval, aggsToChartData } from "./ChartUtils";
import { isPropDefined } from "../general/Utils";


interface Props {
  stacked?: boolean,
  endpoint: string,
  baseUrl?: string,
  aggs: object,
  title: string,
  interval?: DateInterval,
  setBarData: React.Dispatch<React.SetStateAction<any>>
}

function RemoteBarChart(props: Props) {
  const { endpoint, aggs, interval, baseUrl } = props;
  const [labels, setLabels] = useState([])
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    httpClient().post('/' + endpoint + ":aggregations", aggs, {baseURL: baseUrl})
      .then((res: any) => {
        let aggs = res.data.meta.aggregations
        // check if a datetime chart
        if (isPropDefined(interval)) {
          aggs = aggsToChartData(aggs, interval!)
          setDatasets(aggs.datasets)
          setLabels(aggs.labels)
        } else {
          throw Error("interval prop currently needs to be set")
        }
      })
      .catch((error: any) => {
        console.error(error.message)
      })
  }, []);
  
  return (
    <div>
      <BarChart
        {...props}
        labels={ labels }
        datasets={ datasets }
      />
    </div>
  )
}

export default RemoteBarChart;
