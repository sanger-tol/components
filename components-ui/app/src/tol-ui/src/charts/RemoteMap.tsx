/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BubbleMap from "./Map";
import { httpClient } from "../services/http/httpClient";
import Placeholder from "../general/Placeholder";
import { generateFilter } from "../filtering/Utils";


interface MarkerObject {
  geometry: {
    coordinates: number[]
  }
  properties: {
    [key: string]: any
  }
}

/** creates an array of map marker objects with sample information
 * @param {any} elasticData - data returned from elastic endpoint
 * @param {string} latitudeKey - key for the latitude field in elastic data
 * @param {string} longitudeKey - key for the longitude field in elastic data
 * @param {string} attributeKeys - (optional) comma-separated keys for fields to be included in the marker popup
 * @returns {MarkerObject[]} an array of map markers containing coordinate and attribute information
 */

function formattingAttributeKeys(attributeKeysArray, item, marker){
  attributeKeysArray.forEach((key) => {
    // check if the attribute key exists in item.attributes
    if (item.attributes.hasOwnProperty(key)) { //eslint-disable-line
      // add the attribute key and it's value to properties
      marker.properties[key] = item.attributes[key];
    }
  });
  return marker;
}

function createMapMarkers(
  elasticData: any,
  latitudeKey: string,
  longitudeKey: string,
  attributeKeys?: string
): MarkerObject[] {
  const markers: MarkerObject[] = [];
  const attributeKeysArray = attributeKeys ? attributeKeys.split(',').map(key => key.trim()) : [];

  if (latitudeKey.includes('.')  || longitudeKey.includes('.')) {
    const relationshipName = latitudeKey.split('.')[0];
    const latAttribute = latitudeKey.split('.')[1];
    const longAttribute  = longitudeKey.split('.')[1];
    elasticData.forEach((item: any) => {
      if (item.relationships[relationshipName].data){
        const longitude = parseFloat(item.relationships[relationshipName].data.attributes[longAttribute]);
        const latitude = parseFloat(item.relationships[relationshipName].data.attributes[latAttribute]);
        // skips item if no long or lat value is provided
        if (!isNaN(longitude) && !isNaN(latitude)){
          let marker: MarkerObject = {
            geometry: {
              coordinates: [latitude, longitude]
            },
            properties: {}
          };

          if (attributeKeys) {
            marker = formattingAttributeKeys(attributeKeysArray, item, marker);
          }
          markers.push(marker);
        }
      }
    });
  } else {
    for (const item of elasticData) {
      const latitude = parseFloat(item.attributes[latitudeKey]);
      const longitude = parseFloat(item.attributes[longitudeKey]);

      // if latitute and longitude are not provided, skip the current iteration
      if (isNaN(latitude) || isNaN(longitude)) {
        continue;
      }

      // create a marker with coordinate information
      let marker: MarkerObject = {
        geometry: {
          coordinates: [latitude, longitude]
        },
        properties: {}
      };

      // if attributeKeys are given, add them to properties
      if (attributeKeys) {
        marker = formattingAttributeKeys(attributeKeysArray, item, marker);
      }
      markers.push(marker);
    }
  }
  return markers;
}

interface Props {
  id: string,
  bubble?: boolean,
  endpoint: string,
  longitudeKey: string,
  latitudeKey: string,
  attributeKeys?: string
  height?: any,
  pageSize?: number,
  zone?: object,
  baseUrl?: string
}

function RemoteMap(props: Props) {
  const { id, endpoint, baseUrl, longitudeKey, latitudeKey, attributeKeys, zone } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const [markers, setMarkers] = useState<object[]>([]);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number|undefined>(undefined);
  const filter = zone !== undefined ? generateFilter(zone, id) : {};

  // providing a pageSize default
  let pageSize = 2500;
  if (props.pageSize !== undefined) {
    pageSize = props.pageSize;
  }
  
  useEffect(() => {
    setLoading(true);
    setWarningMessage('');
    setErrorMessage('');
    httpClient().get('/' + endpoint + ":count", {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    }).then((res: any) => {
      const count = res.data.meta.total;
      if (count <= pageSize) {
        setCount(res.data.meta.total);
        httpClient().get('/' + endpoint, {
          baseURL: baseUrl, 
          params: {
            filter: filter,
            page_size: pageSize
          }
        }).then((res: any) => {
          const data = res.data.data;
          const markers = createMapMarkers(data, latitudeKey, longitudeKey, attributeKeys);
          setMarkers(markers);
          setWarningMessage(markers.length === 0 ? 'No Data Found' : '');
          setLoading(false);
        }).catch((error: any) => {
          throw error;
        });
      } else {
        setMarkers([]);
        setCount(undefined);
        setLoading(false);
      }
    }).catch((error: any) => {
      setMarkers([]);
      setCount(undefined);
      setLoading(false);
      setErrorMessage(error.message);
      console.error(error.message);
    });
  }, [zone]);

  const map = <BubbleMap {...props} markers={markers} />;
  
  if (errorMessage !== ''){
    return (
      <Placeholder
        errorMessage={errorMessage}
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  if (warningMessage !== ''){
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
    return (
      <Placeholder
        loader
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  if (count === undefined) {
    return (
      <Placeholder
        message={'Please add additional filters to visualise map...'}
        opacity={0.8}
        backing={map}
        height={height}
      />
    );
  }

  return <BubbleMap {...props} markers={markers} />;
}

export default RemoteMap;
