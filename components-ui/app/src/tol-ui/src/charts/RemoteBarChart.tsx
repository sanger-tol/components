/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import {
  generateChartAgg,
  generateChartFilterFromBar,
  HistogramGrouping,
  aggsToBarChartData,
  isChartDataEmpty,
  BarChart,
  useEffectUpdate,
  normaliseCaps,
  Placeholder,
  addSubFilter,
  filterHasUpdated,
  generateFilter,
  resetFiltersBelow,
  PUtilityBar,
  IRemoteTargetAndZone,
  TFilterOrUndefined,
  API_METHODS
} from "..";


/**
 * @autodoc
 * 
 * RemoteBarChart is a chart component that fetches its data from a remote API using the provided `dataSource`,
 * supporting various aggregation and filtering options. The chart dynamically updates
 * based on changes to filters and zone settings and can be configured to display cumulative or stacked data representations.
 * 
 * @prop id - Unique identifier for this chart instance; used as the key for persisted configuration
 * @prop objectType - The object type requested when fetching aggregation data from the API
 * @prop dataSource - Data source for executing API requests to fetch the bar chart's data
 * @prop zone - Current filter zone object used to generate the compound filter data for this chart
 * @prop setZone - Setter used to update the zone when configuration changes reset downstream filters
 * 
 * @prop breakDownBy - The field used to segment the data for the bars in the chart
 * @prop xAxis - Field to display as the x-axis of the chart
 * @prop type - Specifies the type of histogram grouping for data representation
 * @prop chartType - Specifies the type of chart to be used, defaulting to a bar chart
 * 
 * @prop shortDate - Optional flag to display dates in a shortened format
 * @prop stacked - Optional flag to present bars in a stacked format
 * @prop cumulative - Optional flag to display values cumulatively
 * @prop forceUpdate - Optional flat to trigger a re-fetch of the chart data from the server upon changes
 * 
 * @prop buttons - Optional array of JSX elements representing additional action buttons rendered alongside the chart
 * @prop utilityBarConfig - Configuration for the utility bar rendered above the chart
 * @prop contents - Optinal custom overlay or content displayed while loading or handling errors
 * @prop height - Height of the chart container, expressed as an inline CSS style (e.g. "100%")ß
 */

interface PRemoteBarChart extends IRemoteTargetAndZone {
  id: string;
  breakDownBy: string;
  xAxis: string;
  type: HistogramGrouping;
  shortDate?: boolean;
  height?: any;
  stacked?: boolean;
  cumulative?: boolean;
  buttons?: JSX.Element[];
  forceUpdate?: boolean;
  utilityBarConfig?: PUtilityBar;
  contents?: ReactNode;
  chartType?: string;
}

export function RemoteBarChart(props: PRemoteBarChart) {
  const {
    id,
    objectType,
    dataSource,
    breakDownBy,
    xAxis,
    type,
    shortDate,
    zone,
    setZone,
    cumulative,
    forceUpdate,
    contents,
  } = props;
  const height = props.height !== undefined ? props.height : "100%";
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [barData, setBarData] = useState<object>({});
  const [filter, setFilter] = useState<TFilterOrUndefined>({});

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);

    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone! });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    if (!contents) { // This is to stop calls being made when the bar chart is not visible
      setLoading(true);
      const aggs = generateChartAgg(breakDownBy, xAxis, type);
      dataSource
        .custom({
          method: API_METHODS.POST,
          resource: `${objectType}:aggregations`,
          body: aggs,
          params: {
            filter: filter,
          },
        })
        .then((res: any) => {
          let aggs = res.data.meta.aggregations;
          setErrorMessage("");
          setWarningMessage(isChartDataEmpty(aggs));
          aggs = aggsToBarChartData(aggs, type, shortDate, cumulative);
          setDatasets(aggs.datasets);
          setLabels(aggs.labels);
          setLoading(false);
        })
        .catch((error: any) => {
          console.error(error.message);
          setErrorMessage(error.message);
        });
    }
  }, [filter, cumulative, forceUpdate]);

  useEffectUpdate(() => {
    const localFilter = generateChartFilterFromBar(
      barData,
      breakDownBy,
      xAxis,
      type,
    );

    addSubFilter({
      id: id,
      filter: localFilter,
      zone: zone,
    });
    setZone({ ...zone });
  }, [barData]);


  const Contents = () => {

    if (errorMessage !== "") {
      return <Placeholder errorMessage={errorMessage} height={height} />
    }

    if (warningMessage !== "") {
      return <Placeholder warningMessage={warningMessage} />
    }

    if (loading) {
      return <Placeholder bar height={height} />;
    }

    return null;

  }

  //cumulative and undefined setzone negates setBarData
  const setter = cumulative || setZone === undefined ? undefined : setBarData;

  return (
    <BarChart
      {...props}
      contents={contents ? contents : Contents()}
      downloadName={normaliseCaps(objectType)}
      labels={labels}
      datasets={datasets}
      setBarData={setter}
    />
  )
}
