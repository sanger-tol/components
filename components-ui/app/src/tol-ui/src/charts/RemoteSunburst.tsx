/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient'
import { aggsToSunburstData, createAggsViaSliceBy } from "./ChartUtils";
import Sunburst from "./Sunburst";
import Placeholder from "../general/Placeholder";


interface Props {
  endpoint: string,
  title: string,
  sliceBy: string[],
  height: number,
  baseUrl?: string
}

function RemoteSunburst(props: Props) {
  const { endpoint, sliceBy, baseUrl, height } = props;
  const [datasets, setDatasets] = useState({})
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const aggs = createAggsViaSliceBy(endpoint, sliceBy)
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl
    })
    .then((res: any) => {
      let aggs = res.data.meta.aggregations
      // check if a datetime chart
      let data = aggsToSunburstData(aggs, sliceBy)
      setDatasets(data)
      setLoading(false)
      setInitialLoad(false)
    })
    .catch((error: any) => {
      console.error(error.message)
    })
  }, []);
  
  if (loading) {
    if (initialLoad) {
      return <Placeholder circle height={height} />
    }
    return <Placeholder empty height={height} />
  }

  return (
    <Sunburst
      {...props}
      datasets={datasets}
    />
  )
}

export default RemoteSunburst;
