/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, ReactNode } from "react";
import {
  aggsToSunburstData,
  createAggsViaSliceBy,
  isChartDataEmpty,
  generateFilterFromSunburstClick,
  removeSliceBySingles,
  downloadItem,
  Sunburst,
  Placeholder,
  useEffectUpdate,
  resizeListener,
  useZoneStateFallback,
  isEmptyObject,
  normaliseCaps,
  generateFilter,
  addSubFilter,
  filterHasUpdated,
  resetFiltersBelow,
  PUtilityBar,
  PButton,
  UtilityBar,
  TFilterOrUndefined,
  API_METHODS,
  IRemoteTargetAndZone,
  IHeight,
  API_OPERATIONS,
  mergeUtilityBarConfigs
} from "..";

interface PRemoteSunburst extends IRemoteTargetAndZone, IHeight {
  /**
   * Unique identifier for this chart instance; used as the key for persisted configuration
   */
  id: string;
  /**
   * Array of fields by which the data segments in the chart are sliced
   */
  sliceBy: string[];
  /**
   * Describes where to position the legend
   */
  legendPosition?: "top" | "left" | "right" | "bottom";
  /**
   * If true, suppresses labels on the segments of the sunburst
   */
  noLabel?: boolean;
  /**
   * If true, disables the mini sunburst view for nested data exploration
   */
  noMini?: boolean;
  /**
   * If true, hides the download button for exporting chart data (as an image)
   */
  noDownload?: boolean;
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
}

/**
 * @autodoc
 * 
 * RemoteSunburst is a sunburst chart component that visualises hierarchical data using segments.
 * It retrieves its data from a remote API via the provided `dataSource`,
 * supporting dynamic filter generation based on user interactions with the chart slices.
 */
export function RemoteSunburst(props: PRemoteSunburst) {
  const {
    id,
    objectType,
    dataSource,
    sliceBy,
    noMini,
    noDownload,
    forceUpdate,
    utilityBarConfig,
    contents,
    height = "100%",
    noLabel,
  } = props;
  const wrapperId = "tol-sunburst-wrapper-" + id;
  const [datasets, setDatasets] = useState({});
  const [subDatasets, setSubDatasets] = useState({});
  const [zone, setZone] = useZoneStateFallback({ ...props });
  const [resetChart, setResetChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sliceData, setSliceData] = useState({});
  const [filter, setFilter] = useState<TFilterOrUndefined>({});
  const [noLegend, setNoLegend] = useState(false);

  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) setNoLegend(width < 578);
  });

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    if (!contents) {
      setLoading(true);
      const aggs = createAggsViaSliceBy(objectType, sliceBy);
      dataSource
        .custom({
          method: API_METHODS.POST,
          resource: `${objectType}${API_OPERATIONS.AGGREGATIONS}`,
          body: {...aggs, filter: generateFilter(zone, id, true)},
        })
        .then((res: any) => {
          const aggs = res.data.meta.aggregations;
          setErrorMessage("");
          setWarningMessage(isChartDataEmpty(aggs));
          const data = aggsToSunburstData(aggs, sliceBy);
          setDatasets(data);
          setSliceData({});
        })
        .catch((error: any) => {
          setErrorMessage(error.message);
          console.error(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [filter, forceUpdate]);

  // for sub sunburst updates
  useEffectUpdate(() => {
    if (!contents) {
      const localFilter = generateFilterFromSunburstClick(sliceData, datasets);
      // this also resets components below
      addSubFilter({
        id: id,
        filter: localFilter,
        zone: zone,
      });
      setZone({ ...zone });
      // clear sub sunburst
      if (isEmptyObject(sliceData)) {
        setSubDatasets({});
        // go deeper into the sunburst if not outer ring
      } else if (sliceData["datasetIndex"] !== 0) {
        const subSliceBy = removeSliceBySingles(sliceBy, sliceData["depth"]);
        setSubLoading(true);
        const aggs = createAggsViaSliceBy(
          objectType,
          subSliceBy,
        );
        dataSource
          .custom({
            method: API_METHODS.POST,
            resource: `${objectType}${API_OPERATIONS.AGGREGATIONS}`,
            body: {...aggs, filter: generateFilter(zone, id, true)},
          })
          .then((res: any) => {
            const aggs = res.data.meta.aggregations;
            setErrorMessage("");
            setWarningMessage(isChartDataEmpty(aggs));
            const data = aggsToSunburstData(aggs, subSliceBy);
            setSubDatasets(data);
            setSubLoading(false);
          })
          .catch((error: any) => {
            // forces an error in the main sunburst
            setErrorMessage(error.message);
            console.error(error.message);
          });
      }
    }
  }, [sliceData]);

  const Contents = () => {
    if (errorMessage !== "") {
      return <Placeholder errorMessage={errorMessage} />
    }

    if (loading) {
      return <Placeholder pie />
    }
  }

  const resetButton: PButton = (!isEmptyObject(datasets) ? {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => {
      setSubDatasets({});
      setResetChart(!resetChart);
    },
    icon: "undo",
  } : {
    visible: false,
  })

  const downloadButton: PButton = !noDownload ? {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => {
      downloadItem(props.id, normaliseCaps(objectType));
    },
    icon: "download",
    disabled: isEmptyObject(datasets),
  } : {}

  const miniActive = noMini === true ? false : !isEmptyObject(subDatasets);
  const setter = setZone === undefined ? undefined : setSliceData;
  const mainPlacement = noLegend ? { paddingTop: 150 } : { paddingLeft: 150 };

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        resetButton,
        downloadButton,
      ]
    }
  )

  return (
    <div
      id={wrapperId}
      style={{ height: height, position: miniActive ? "relative" : undefined }}
    >
      <UtilityBar id={id} {...ubc} />
      <div className="tol-component-contents with-offset">
        {contents ? contents :
          <>
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
                    utilityBarConfig={null}
                    height={"100%"}
                  />
                )}
              </div>
            ) : null}
            <div
              className={miniActive ? "sunburst-mini" : "tol-component-contents"}
            >
              {warningMessage !== "" ?
                <Placeholder warningMessage={warningMessage} />
                :
                <Sunburst
                  {...props}
                  noRefresh
                  noDownload
                  contents={contents ? contents : Contents()}
                  datasets={datasets}
                  downloadName={normaliseCaps(objectType)}
                  setSliceData={miniActive ? undefined : setter}
                  noLegend={miniActive ? true : noLegend}
                  noLabel={miniActive ? true : noLabel}
                  resetChart={resetChart}
                  utilityBarConfig={null}
                  height={"100%"}
                />
              }
            </div>
          </>
        }
      </div>
    </div>
  );
}
