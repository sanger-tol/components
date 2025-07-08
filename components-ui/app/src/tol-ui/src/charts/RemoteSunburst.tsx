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
  IUtilityBar,
  IButton,
  UtilityBar,
  TFilterOrUndefined,
  API_METHODS,
  IRemoteTargetAndZone
} from "..";


interface Props extends IRemoteTargetAndZone {
  id: string;
  sliceBy: string[];
  height?: any;
  legendPosition?: string;
  noLabel?: boolean;
  noMini?: boolean;
  noDownload?: boolean;
  forceUpdate?: boolean;
  utilityBarConfig?: IUtilityBar;
  contents?: ReactNode;
}

export function RemoteSunburst(props: Props) {
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
  const [zone, setZone] = useZoneStateFallback({...props});
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
          resource: `${objectType}:aggregations`,
          body: aggs,
          params: {
            filter: generateFilter(zone, id, true),
          },
        })
        .then((res: any) => {
          const aggs = res.data.meta.aggregations;
          setErrorMessage("");
          setWarningMessage(isChartDataEmpty(aggs));
          const data = aggsToSunburstData(aggs, sliceBy);
          setDatasets(data);
          setSliceData({});
          setLoading(false);
        })
        .catch((error: any) => {
          setErrorMessage(error.message);
          console.error(error.message);
        });
    }
  }, [filter, forceUpdate]);

  // for sub sunburst updates
  useEffectUpdate(() => {
    if (!contents) {
      const localFilter = generateFilterFromSunburstClick(sliceData);
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
        setSubLoading(true);
        const aggs = createAggsViaSliceBy(
          objectType,
          removeSliceBySingles(sliceBy, sliceData["depth"]),
        );
        dataSource
          .custom({
            method: API_METHODS.POST,
            resource: `${objectType}:aggregations`,
            body: aggs,
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
      downloadItem(props.id, normaliseCaps(objectType));
    },
    icon: "download",
  } : {};

  const miniActive = noMini === true ? false : !isEmptyObject(subDatasets);
  const setter = setZone === undefined ? undefined : setSliceData;
  const mainPlacement = noLegend ? { paddingTop: 150 } : { paddingLeft: 150 };

  return (
    <div
      id={wrapperId}
      style={{ height: height, position: miniActive ? "relative" : undefined }}
    >
      <UtilityBar
        id={id}
        title={utilityBarConfig?.title}
        buttons={[
          ...(utilityBarConfig?.buttons || []),
          resetButton,
          downloadButton
        ]}
      />
      <div className="tol-component-contents-with-offset">
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
