/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  IRemoteTargetAndZone,
  TFilterOrUndefined,
  Map,
  API_METHODS,
  Placeholder,
  generateFilter,
  createMapMarkers
} from "..";


interface Props extends IRemoteTargetAndZone {
  id: string;
  bubble?: boolean;
  longitudeKey: string;
  latitudeKey: string;
  attributeKeys?: string;
  height?: any;
  pageSize?: number;
  // Used to apply custom legend keys based on whats is returned,
  // must return an object in format {key: string, colour: string}
  markerRenderer?: Function;
}

/**
 * @autodoc
 * 
 * RemoteMap is a component that visualises geographical data on a map based on the data retrieved
 * from a remote `dataSource`. It fetches location data using specified latitude and longitude keys,
 * dynamically generating map markers.
 * Users can also customise the appearance of markers through a provided renderer function.
 * 
 * @prop id - Unique identifier for this map instance, utilised in API interactions and state management
 * @prop objectType - The type of remote object being retrieved and displayed on the map
 * @prop dataSource - The data source utilised for executing API requests to fetch data for rendering map markers
 * @prop longitudeKey - The key used to extract longitude values from the data
 * @prop latitudeKey - The key used to extract latitude values from the data
 * @prop attributeKeys - Optional string representing additional attribute keys for customising marker appearances
 * @prop zone - Current filter zone object affecting the data retrieved for the map
 * @prop height - The height of the map container, expressed in a CSS unit
 * @prop pageSize - Optional parameter to limit the number of data points retrieved for rendering markers (default is set to 2500)
 * @prop markerRenderer - Optional function to apply custom legend keys and rendering logic for markers based on the returned data set
 */
export function RemoteMap(props: Props) {
  const {
    id,
    objectType,
    dataSource,
    longitudeKey,
    latitudeKey,
    attributeKeys,
    zone,
    markerRenderer,
  } = props;
  const height = props.height !== undefined ? props.height : "100%";
  const [markers, setMarkers] = useState<object[]>([]);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [legendKey, setLegendKey] = useState<object[]>([]);
  const filter: TFilterOrUndefined = zone !== undefined
    ? generateFilter(zone, id)
    : {};

  // providing a pageSize default
  let pageSize = 2500;
  if (props.pageSize !== undefined) {
    pageSize = props.pageSize;
  }

  useEffect(() => {
    setLoading(true);
    setWarningMessage("");
    setErrorMessage("");
    dataSource
      .custom({
        method: API_METHODS.GET,
        resource: `${objectType}:count`,
        params: {
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
  }, [zone]);

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
