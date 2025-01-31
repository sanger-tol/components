/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import BarChart from "./BarChart";
import {
  generateChartAgg,
  generateChartFilterFromBar,
  HistogramGrouping,
  aggsToBarChartData,
  isChartDataEmpty,
  IYAxis
} from "./Utils";
import { useEffect, useState } from 'react';
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { normaliseCaps } from "../general/Utils";
import { httpClient } from '../services/http/httpClient';
import Placeholder from "../general/Placeholder";
import {
  addSubFilter,
  filterHasUpdated,
  generateFilter,
  resetFiltersBelow
} from "../filtering/Utils";


interface Props {
  id: string,
  title: string,
  endpoint: string,
  baseUrl?: string
  breakDownBy: string,
  xAxis: string,
  yAxis?: IYAxis,
  type: HistogramGrouping,
  shortDate?: boolean
  zone?: any,
  setZone?: any,
  height?: any,
  stacked?: boolean,
  cumulative?: boolean,
  aggType?: 'sum' | 'count'
}

function RemoteBarChart(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
    breakDownBy,
    xAxis,
    type,
    shortDate,
    zone,
    setZone,
    cumulative,
    aggType = 'count',
    yAxis
  } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [barData, setBarData] = useState<object>({});
  const [filter, setFilter] = useState<object|undefined>({});
  
  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({id: id, zone: zone!});
      setZone({...zone});
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
    const aggs = generateChartAgg(breakDownBy, xAxis, type, aggType, yAxis);
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    })
      .then((res: any) => {
        let aggs = res.data.meta.aggregations;
        console.log(aggs)
        setErrorMessage('');
        setWarningMessage(isChartDataEmpty(aggs));
        aggs = aggsToBarChartData(aggs, type, shortDate, cumulative, yAxis);
        setDatasets(aggs.datasets);
        setLabels(aggs.labels);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error(error.message);
        setErrorMessage(error.message);
      });
    }, [filter, cumulative]); 

  
  useEffectUpdate(() => {
    const localFilter = generateChartFilterFromBar(
      barData,
      breakDownBy,
      xAxis,
      type
    );
    
    addSubFilter({
      id: id,
      filter: localFilter,
      zone: zone
    });
    setZone({...zone});
  }, [barData]);

  if (errorMessage !== ''){
    return (
      <Placeholder
        errorMessage={errorMessage}
        height={height}
      />
    );
  }

  if (warningMessage !== ''){
    return (
      <Placeholder
        warningMessage={warningMessage}
        height={height}
      />
    );
  }
  
  if (loading) {
    return <Placeholder bar height={height} />;
  }

  //cumulative and undefined setzone negates setBarData
  const setter = (cumulative || setZone === undefined) ? undefined : setBarData;

  return (
    <BarChart
      {...props}
      downloadName={normaliseCaps(endpoint)}
      labels={labels}
      datasets={datasets}
      setBarData={setter}
    />
  );
}

export default RemoteBarChart;
