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
} from "./utils";
import { ReactNode, useEffect, useState } from "react";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { normaliseCaps } from "../general/utils";
import { httpClient } from "../services/http/httpClient";
import Placeholder from "../general/Placeholder";
import {
  addSubFilter,
  filterHasUpdated,
  generateFilter,
  resetFiltersBelow,
} from "../filtering/utils";
import { IUtilityBar } from "../general/UtilityBar";

interface Props {
  id: string;
  endpoint: string;
  baseUrl?: string;
  breakDownBy: string;
  xAxis: string;
  type: HistogramGrouping;
  shortDate?: boolean;
  zone?: any;
  setZone?: any;
  height?: any;
  stacked?: boolean;
  cumulative?: boolean;
  buttons?: JSX.Element[];
  forceUpdate?: boolean;
  utilityBarConfig?: IUtilityBar;
  contents?: ReactNode;
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
    forceUpdate,
    contents
  } = props;
  const height = props.height !== undefined ? props.height : "100%";
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [barData, setBarData] = useState<object>({});
  const [filter, setFilter] = useState<object | undefined>({});

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
      httpClient()
        .post("/" + endpoint + ":aggregations", aggs, {
          baseURL: baseUrl,
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
    <div style={{ height: height }}>
      <div className="tol-component-contents">
        <BarChart
          {...props}
          contents={contents ? contents : Contents()}
          downloadName={normaliseCaps(endpoint)}
          labels={labels}
          datasets={datasets}
          setBarData={setter}
        />
      </div>
    </div>
  )
}

export default RemoteBarChart;
