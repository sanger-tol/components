/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, ReactNode } from "react";
import {
  IRemoteTargetAndZone,
  TFilterOrUndefined,
  Map,
  API_METHODS,
  Placeholder,
  generateFilter,
  createMapMarkers,
  IHeight,
  filterHasUpdated,
  resetFiltersBelow,
  useEffectUpdate
} from "..";

export interface PRemoteMap extends IRemoteTargetAndZone, IHeight {
  /**
   * Unique identifier for this map instance, utilised in API interactions and state management
   */
  id: string;
  /**
   * Whether the map should bubble
   */
  bubble?: boolean;
  /**
   * The key used to extract longitude values from the data
   */
  longitudeKey: string;
  /**
   * The key used to extract latitude values from the data
   */
  latitudeKey: string;
  /**
   * Optional string representing additional attribute keys for customising marker appearances. These populate the marker tooltip
   */
  attributeKeys?: string;
  /**
   * Optional parameter to limit the number of data points retrieved for rendering markers (default is set to 2500)
   */
  pageSize?: number;
  /**
   * Used to apply custom legend keys based on whats is returned, must return an object in format {key: string, colour: string}
   */
  markerRenderer?: Function;
  /**
   * Optional custom overlay or content displayed while loading or handling errors
   */
  contents?: ReactNode;
  /**
   * Optional flag to trigger a re-fetch of the chart data from the server upon changes
   */
  forceUpdate?: boolean;
}

/**
 * @autodoc
 * 
 * RemoteMap is a component that visualises geographical data on a map based on the data retrieved
 * from a remote `dataSource`. It fetches location data using specified latitude and longitude keys,
 * dynamically generating map markers.
 * Users can also customise the appearance of markers through a provided renderer function.
 */
export function RemoteMap(props: PRemoteMap) {
  const {
    id,
    objectType,
    dataSource,
    longitudeKey,
    latitudeKey,
    attributeKeys,
    pageSize = 2500,
    zone,
    setZone,
    markerRenderer,
    contents,
    forceUpdate
  } = props;
  const height = props.height !== undefined ? props.height : "100%";
  const [markers, setMarkers] = useState<object[]>([]);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [legendKey, setLegendKey] = useState<object[]>([]);
  const [filter, setFilter] = useState<TFilterOrUndefined>();

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
    setWarningMessage("");
    setErrorMessage("");
    dataSource
      .custom({
        method: API_METHODS.POST,
        resource: `${objectType}:count`,
        body: {
          filter: filter,
        },
      })
      .then((res: any) => {
        const count = res.data.meta.total;
        if (count <= pageSize) {
          setCount(res.data.meta.total);
          dataSource
            .custom({
              method: API_METHODS.GET,
              resource: objectType,
              params: {
                filter,
                page_size: pageSize,
              }
            })
            .then((res) => {
              const markers = createMapMarkers(
                res.data.data,
                latitudeKey,
                longitudeKey,
                legendKey,
                setLegendKey,
                attributeKeys,
                markerRenderer,
              );
              setMarkers(markers);
              setWarningMessage(markers.length === 0 ? "No Location Data Found" : "");
              setLoading(false);
            })
            .catch((error: any) => {
              throw error;
            });
        } else {
          setMarkers([]);
          setCount(undefined);
          setLoading(false);
        }
      })
      .catch((error: any) => {
        setMarkers([]);
        setCount(undefined);
        setLoading(false);
        setErrorMessage(error.message);
        console.error(error.message);
      });
  }, [filter, forceUpdate]);

  const map = <Map {...props} markers={markers} />;

  if (errorMessage !== "") {
    return (
      <Placeholder
        errorMessage={errorMessage}
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  if (warningMessage !== "") {
    return (
      <Placeholder
        warningMessage={warningMessage}
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  if (contents) {
    return <>{contents}</>
  }

  if (loading) {
    return <Placeholder loader opacity={0.8} backing={map} height={height} />;
  }

  if (count === undefined) {
    return (
      <Placeholder
        message={"Please add additional filters to visualise map..."}
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  return <Map {...props} legend={legendKey} markers={markers} />;
}
