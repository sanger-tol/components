/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BubbleMap from "./BubbleMap";
import { httpClient } from "../services/http/httpClient";
import Placeholder from "../general/Placeholder";


interface Props {
    endpoint: string,
    longitudeKey: string,
    latitudeKey: string,
    attributeKeys?: string
    height: number,
    pageSize?: number,
    filter?: object,
    baseUrl?: string
}

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
function createMapMarkers(
    elasticData: any,
    latitudeKey: string,
    longitudeKey: string,
    attributeKeys?: string
): MarkerObject[] {
    const markers: MarkerObject[] = []
    const attributeKeysArray = attributeKeys ? attributeKeys.split(',').map(key => key.trim()) : [];

    for (const item of elasticData) {
        const latitude = parseFloat(item.attributes[latitudeKey])
        const longitude = parseFloat(item.attributes[longitudeKey])

        // if latitute and longitude are not provided, skip the current iteration
        if (isNaN(latitude) || isNaN(longitude)) {
            continue
        }

        // create a marker with coordinate information
        const marker: MarkerObject = {
            geometry: {
                coordinates: [latitude, longitude]
            },
            properties: {}
        }

        // if attributeKeys are given, add them to properties
        if (attributeKeys) {
            attributeKeysArray.forEach((key) => {
                // check if the attribute key exists in item.attributes
                if (item.attributes.hasOwnProperty(key)) {
                    // add the attribute key and it's value to properties
                    marker.properties[key] = item.attributes[key]
                }
            })
        }
        markers.push(marker)
    }
    return markers
}

function RemoteBubbleMap(props: Props) {
    const { endpoint, baseUrl, longitudeKey, latitudeKey, attributeKeys, filter, height } = props;
    const [ markers, setMarkers ] = useState<object[]>([]);
    const [ errorMessage, setErrorMessage ] = useState<string>('')
    const [ loading, setLoading ] = useState(true)
    const [ totalMarkers, setTotalMarkers ] = useState<number>(0)

    // providing a pageSize default
    let pageSize = 2000
    if (props.pageSize !== undefined) {
        pageSize = props.pageSize
    }

    useEffect(() => {
        setLoading(true)
        httpClient().get('/' + endpoint, {
            baseURL: baseUrl, 
            params: {
                filter: filter,
                page_size: pageSize
            }
        })
        .then((res: any) => {
            setErrorMessage('')
            setTotalMarkers(res.data.meta.total)
            const data = res.data.data
            const markers = createMapMarkers(data, latitudeKey, longitudeKey, attributeKeys)
            setMarkers(markers)
            setLoading(false)
        })
        .catch((error: any) => {
            console.error(error.message)
            setErrorMessage(error.message)
        })
    }, [filter]);

    const emptyMap = <BubbleMap {...props} markers={[]} />
    
    if (errorMessage !== ''){
        return (
            <Placeholder
                errorMessage={errorMessage}
                height={height}
            />
        );
    }

    if (loading) {
        return (
            <Placeholder
                loader
                opacity={0.85}
                backing={emptyMap}
                height={height}
            />
        );
    }

    if (totalMarkers >= pageSize) {
        return (
            <Placeholder
                message={'Please add additional filters to visualise map...'}
                opacity={0.85}
                backing={emptyMap}
                height={height}
            />
        );
    }

    return <BubbleMap {...props} markers={markers} />
}

export default RemoteBubbleMap;
