/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import RemoteAggBarChart from "./RemoteAggBarChart";
import { generateDateAgg, generateDateFilterFromBarData, DateInterval } from "./ChartUtils";
import { useState } from 'react';
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { mergeFilters } from "../general/Filter";
import { normaliseCaps } from "../general/Utils";



interface Props {
  id: string,
  title: string,
  endpoint: string,
  breakDownBy: string,
  xAxis: string,
  interval: DateInterval,
  type: 'date',
  shortDate?: boolean

  // 'filter' is usually referred to as globalFilters when using combinedFilters
  filter?: object,
  setCombinedFilters?: Function, // eslint-disable-line

  // config
  height?: any,
  stacked?: boolean,
  baseUrl?: string
}

function RemoteBarChart(props: Props) {
  // @ts-ignore
  const { breakDownBy, xAxis, interval, type, shortDate, filter, setCombinedFilters } = props; // eslint-disable-line
  const [barData, setBarData] = useState<object>({});

  // these can be swapped for other barchart types (type prop will be used)
  const aggs = generateDateAgg(breakDownBy, xAxis, interval);
  const localFilter = generateDateFilterFromBarData(barData, breakDownBy, xAxis, interval);

  // create alternate title based on title - sequencer - month/year
  const alternateTitle = (normaliseCaps(props.title === undefined ? "" : props.title) 
    + " - " + normaliseCaps(barData["bucket"]) 
    + " - " + normaliseCaps(barData["clickKey"]));

  // combine local and globalFilters
  useEffectUpdate(() => {
    if (setCombinedFilters !== undefined) {
      setCombinedFilters(
        mergeFilters(filter, localFilter)
      );
    }
  }, [barData]);

  // reset localFilters when globalFilters are updated
  useEffectUpdate(() => {
    if (setCombinedFilters !== undefined) {
      setCombinedFilters(Object.assign({}, filter));
    }
  }, [filter]);

  return (
    <RemoteAggBarChart
      {...props}
      downloadName={barData["clickKey"] === undefined ? props.title : alternateTitle}
      aggs={ aggs }
      filter={ filter }
      setBarData={
        setCombinedFilters === undefined ? undefined : setBarData
      }
    />
  );
}

export default RemoteBarChart;
