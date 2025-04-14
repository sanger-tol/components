/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from "../services/http/httpClient";
import {
  aggsToSunburstData,
  createAggsViaSliceBy,
  isChartDataEmpty,
  generateFilterFromSunburstClick,
  removeSliceBySingles,
  downloadItem,
} from "./utils";
import Sunburst from "./Sunburst";
import Placeholder from "../general/Placeholder";
import { useEffectUpdate, resizeListener } from "../hooks";
import { isEmptyObject, normaliseCaps } from "../general/utils";
import {
  generateFilter,
  addSubFilter,
  filterHasUpdated,
  resetFiltersBelow,
} from "../filtering/utils";
import { IUtilityBar } from "../general/UtilityBar";
import { IButton } from "../general/Button";
import { UtilityBar } from "../index";

interface Props {
  id: string;
  endpoint: string;
  sliceBy: string[];
  height?: any;
  baseUrl?: string;
  legendPosition?: string;
  noLabel?: boolean;
  noMini?: boolean;
  noDownload?: boolean;
  zone?: object;
  setZone?: any;
  forceUpdate?: boolean;
  utilityBarConfig?: IUtilityBar;
}

function RemoteSunburst(props: Props) {
  const {
    id,
    endpoint,
    sliceBy,
    baseUrl,
    noMini,
    noDownload,
    zone,
    setZone,
    forceUpdate,
    utilityBarConfig
  } = props;
  const wrapperId = "tol-sunburst-wrapper-" + id; // gets width on mount
  const height = props.height !== undefined ? props.height : "100%";
  const [datasets, setDatasets] = useState({});
  const [subDatasets, setSubDatasets] = useState({});
  const [resetChart, setResetChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sliceData, setSliceData] = useState({});
  const [filter, setFilter] = useState<object | undefined>({});
  const [noLegend, setNoLegend] = useState(false);

  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) setNoLegend(width < 578);
  });

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone! });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
    const aggs = createAggsViaSliceBy(endpoint, sliceBy);
    httpClient()
      .post("/" + endpoint + ":aggregations", aggs, {
        baseURL: baseUrl,
        params: {
          filter: filter,
        },
      })
      .then((res: any) => {
        const aggs = res.data.meta.aggregations;
        setErrorMessage("");
        setWarningMessage(isChartDataEmpty(aggs));
        const data = aggsToSunburstData(aggs, sliceBy);
        setDatasets(data);
        if (setZone) setSliceData({});
        setLoading(false);
      })
      .catch((error: any) => {
        setErrorMessage(error.message);
        console.error(error.message);
      });
  }, [filter, forceUpdate]);

  // for sub sunburst updates
  useEffectUpdate(() => {
    const localFilter = generateFilterFromSunburstClick(sliceData);
    // this also resets components below
    addSubFilter({
      id: id,
      filter: localFilter,
      zone: zone!,
    });
    setZone({ ...zone });
    // clear sub sunburst
    if (isEmptyObject(sliceData)) {
      setSubDatasets({});
      // go deeper into the sunburst if not outer ring
    } else if (sliceData["datasetIndex"] !== 0) {
      setSubLoading(true);
      const aggs = createAggsViaSliceBy(
        endpoint,
        removeSliceBySingles(sliceBy, sliceData["depth"]),
      );
      httpClient()
        .post("/" + endpoint + ":aggregations", aggs, {
          baseURL: baseUrl,
          params: {
            filter: generateFilter(zone, id, true),
          },
        })
        .then((res: any) => {
          const aggs = res.data.meta.aggregations;
          setErrorMessage("");
          setWarningMessage(isChartDataEmpty(aggs));
          const data = aggsToSunburstData(aggs, sliceBy);
          setSubDatasets(data);
          setSubLoading(false);
        })
        .catch((error: any) => {
          // forces an error in the main sunburst
          setErrorMessage(error.message);
          console.error(error.message);
        });
    }
  }, [sliceData]);

  if (errorMessage !== "") {
    return <Placeholder errorMessage={errorMessage} height={height} />;
  }

  if (loading) {
    return (
      <div id={wrapperId} style={{ height: height }}>
        <Placeholder pie />
      </div>
    );
  }

  const resetButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => {
      setSubDatasets({});
      setResetChart(!resetChart);
    },
    icon: "undo",
  }

  const downloadButton: IButton = !noDownload ? {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => {
      downloadItem(props.id, normaliseCaps(endpoint));
    },
    icon: "download",
  }: {};

  const headerPadding = 37;
  const miniActive = noMini === true ? false : !isEmptyObject(subDatasets);
  const setter = setZone === undefined ? undefined : setSliceData;
  const mainPlacement = noLegend
    ? { paddingTop: 150 - headerPadding }
    : { paddingLeft: 150 };
  mainPlacement["paddingBottom"] = headerPadding;

  return (
    <div
      id={wrapperId}
      style={{ height: height, position: miniActive ? "relative" : undefined }}
    >
      <UtilityBar
        title={utilityBarConfig?.title}
        buttons={[
          ...(utilityBarConfig?.buttons || []),
          resetButton,
          downloadButton
        ]}
      />
      {miniActive ? (
        <div className="sunburst-sub" style={mainPlacement}>
          {subLoading ? (
            <Placeholder clear loader />
          ) : (
            <Sunburst
              {...props}
              id={id}
              noRefresh
              noDownload
              datasets={subDatasets}
              setSliceData={setter}
              noLegend={noLegend}
              height="100%"
              utilityBarConfig={undefined}
            />
          )}
        </div>
      ) : null}
      <div
        className={miniActive ? "sunburst-mini" : ""}
        style={
          miniActive
            ? { paddingTop: headerPadding }
            : { height: height, paddingBottom: headerPadding }
        }
      >
        {warningMessage !== "" ?
          <Placeholder warningMessage={warningMessage} style={{ marginTop: 8 }} />
          :
          <Sunburst
            {...props}
            noRefresh
            noDownload
            datasets={datasets}
            downloadName={normaliseCaps(endpoint)}
            setSliceData={setter}
            noLegend={miniActive ? true : noLegend}
            resetChart={resetChart}
            height="100%"
            utilityBarConfig={undefined}
          />
        }
      </div>
    </div>
  );
}

export default RemoteSunburst;
