/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import Map from "./Map";
import { httpClient } from "../services/http/httpClient";
import Placeholder from "../general/Placeholder";
import { generateFilter } from "../filtering/Utils";
import { createMapMarkers } from "./Utils";

interface Props {
  id: string;
  bubble?: boolean;
  endpoint: string;
  longitudeKey: string;
  latitudeKey: string;
  attributeKeys?: string;
  height?: any;
  pageSize?: number;
  zone?: object;
  baseUrl?: string;
  markerRenderer?: Function; // Used to apply custom legend keys based on whats is returned, must return an object in format {key: string, colour: string}
}

function RemoteMap(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
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
  const filter = zone !== undefined ? generateFilter(zone, id) : {};

  // providing a pageSize default
  let pageSize = 2500;
  if (props.pageSize !== undefined) {
    pageSize = props.pageSize;
  }

  useEffect(() => {
    setLoading(true);
    setWarningMessage("");
    setErrorMessage("");
    httpClient()
      .get("/" + endpoint + ":count", {
        baseURL: baseUrl,
        params: {
          filter: filter,
        },
      })
      .then((res: any) => {
        const count = res.data.meta.total;
        if (count <= pageSize) {
          setCount(res.data.meta.total);
          httpClient()
            .get("/" + endpoint, {
              baseURL: baseUrl,
              params: {
                filter: filter,
                page_size: pageSize,
              },
            })
            .then((res: any) => {
              const data = res.data.data;
              const markers = createMapMarkers(
                data,
                latitudeKey,
                longitudeKey,
                legendKey,
                setLegendKey,
                attributeKeys,
                markerRenderer,
              );
              setMarkers(markers);
              setWarningMessage(markers.length === 0 ? "No Data Found" : "");
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

export default RemoteMap;
