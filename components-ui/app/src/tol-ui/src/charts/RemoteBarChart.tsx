/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import BarChart from "./BarChart";
import {
  generateChartAgg,
  generateChartFilterFromBar,
  DateInterval,
  aggsToBarChartData,
  isChartDataEmpty
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
  type: DateInterval,
  shortDate?: boolean
  zone: any,
  setZone: any,
  height?: any,
  stacked?: boolean,
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
    setZone
  } = props;
  const subId = 'tol-sub-chart-' + id;
  const height = (props.height !== undefined) ? props.height : "100%";
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [barData, setBarData] = useState<object>({});
  const [filter, setFilter] = useState({});

  // create alternate title based on title - sequencer - month/year
  const alternateTitle = (normaliseCaps(props.title === undefined ? "" : props.title) 
    + " - " + normaliseCaps(barData["bucket"]) 
    + " - " + normaliseCaps(barData["clickKey"]));

  useEffect(() => {
    const compoundedFilter = generateFilter(id, zone);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(filter, compoundedFilter, setFilter)) {
      resetFiltersBelow({id: id, zone: zone!});
      setZone({...zone});
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
    const aggs = generateChartAgg(breakDownBy, xAxis, type);
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    })
      .then((res: any) => {
        let aggs = res.data.meta.aggregations;
        setErrorMessage('');
        setWarningMessage(isChartDataEmpty(aggs));
        aggs = aggsToBarChartData(aggs, type, shortDate);
        setDatasets(aggs.datasets);
        setLabels(aggs.labels);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error(error.message);
        setErrorMessage(error.message);
      });
  }, [filter]);

  // for bar click updates
  useEffectUpdate(() => {
    const localFilter = generateChartFilterFromBar(
      barData,
      breakDownBy,
      xAxis,
      type
    );
    // this also resets components below
    addSubFilter({
      id: id,
      subId: subId,
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

  const setter = (setZone === undefined) ? undefined : setBarData;

  return (
    <BarChart
      downloadName={barData["clickKey"] === undefined ? props.title : alternateTitle}
      {...props}
      labels={labels}
      datasets={datasets}
      setBarData={setter}
    />
  );
}

export default RemoteBarChart;
