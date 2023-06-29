/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import { httpClient } from '../services/http/httpClient'
import { aggsToChartData } from "./ChartUtils";
import { isPropDefined } from "../general/Utils";


interface Props {
  stacked?: boolean,
  endpoint: string,
  aggs: object,
  title: string,
  setBarData: React.Dispatch<React.SetStateAction<any>>|null
}

// currently under construction...
function RemoteBarChart(props: Props) {
  const { endpoint, aggs, title, setBarData } = props;
  const stacked = isPropDefined(props.stacked)

  const [labels, setLabels] = useState([])
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    httpClient().post('/' + endpoint + ":aggregations", aggs, {})
      .then((res: any) => {
        let aggs = res.data.meta.aggregations
        aggs = aggsToChartData(aggs)
        setDatasets(aggs.datasets)
        setLabels(aggs.labels)
      })
      .catch((error: any) => {
        console.log(error.message)
      })
  }, []);
  
  return (
    <div>
      <BarChart
        stacked={ stacked }
        title={ title }
        labels={ labels }
        datasets={ datasets }
        setBarData={ setBarData }
      />
    </div>
  )
}

export default RemoteBarChart;
