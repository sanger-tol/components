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
  API_METHODS,
  IHeight,
  API_OPERATIONS,
  TAggregationResult,
  NO_DATA_FOUND_MESSAGE
} from "..";

interface PRemoteBarChart extends IRemoteTargetAndZone, IHeight {
  /**
   * Unique identifier for this chart instance; used as the key for persisted configuration
   */
  id: string;
  /**
   * The field used to segment the data for the bars in the chart
   */
  breakDownBy: string;
  /**
   * Field to display as the x-axis of the chart
   */
  xAxis: string;
  /**
   * Specifies the type of histogram grouping for data representation
   */
  type: HistogramGrouping;
  /**
   * Optional flag to display dates in a shortened format
   */
  shortDate?: boolean;
  /**
   * Optional flag to present bars in a stacked format
   */
  stacked?: boolean;
  /**
   * Optional flag to display values on the chart cumulatively
   */
  cumulative?: boolean;
  /**
   * Optional array of JSX elements representing additional action buttons rendered alongside the chart
   */
  buttons?: JSX.Element[];
  /**
   * Optional flag to trigger a re-fetch of the chart data from the server upon changes
   */
  forceUpdate?: boolean;
  /**
   * Configuration for the utility bar rendered above the chart
   */
  utilityBarConfig?: PUtilityBar;
  /**
   * Optional custom overlay or content displayed while loading or handling errors
   */
  contents?: ReactNode;
  /**
   * Specifies the type of chart to be used, defaulting to a bar chart
   */
  chartType?: string;
}

/**
 * @autodoc
 * 
 * RemoteBarChart is a chart component that fetches its data from a remote API using the provided `dataSource`,
 * supporting various aggregation and filtering options. The chart dynamically updates
 * based on changes to filters and zone settings and can be configured to display cumulative or stacked data representations.
 */
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
          resource: `${objectType}${API_OPERATIONS.AGGREGATIONS}`,
          body: {...aggs, filter: filter},
        })
        .then((res: any) => {
          const response = res.data;
          setErrorMessage("");
          setWarningMessage(response ? "" : NO_DATA_FOUND_MESSAGE);

          const aggs = aggsToBarChartData(response, type, shortDate, cumulative);
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
