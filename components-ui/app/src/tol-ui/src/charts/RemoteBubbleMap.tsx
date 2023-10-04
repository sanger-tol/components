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
    height: number,
    pageSize?: number,
    filter?: object,
    baseUrl?: string
}

/* converts elastic data format to points parameter BubbleMap accepts */
function elasticToChartData(
    elasticData: any, 
    longitudeKey: string, 
    latitudeKey: string
    ): number[][] {
        /**
         * @param longitudeKey the key used to represent longitude values in elastic data
         * @param latitudeKey the key used to represent latitude values in elastic data
         */
        const points: number[][] = [];
    if (latitudeKey.includes('.')  || longitudeKey.includes('.')){
        const relationship_name = latitudeKey.split('.')[0]
        const lat_attribute_name = latitudeKey.split('.')[1]
        const long_attribute_name  = longitudeKey.split('.')[1]
        elasticData.forEach((item) => {
            if (item.relationships[relationship_name].data){
                const longitude = parseFloat(item.relationships[relationship_name].data.attributes[long_attribute_name])
                const latitude = parseFloat(item.relationships[relationship_name].data.attributes[lat_attribute_name])
                // skips item if no long or lat value is provided
                if (!isNaN(longitude) && !isNaN(latitude)){
                    points.push([latitude, longitude])
                }
            }
        }
        )
    }else{
        elasticData.forEach((item) => {
            const longitude = parseFloat(item.attributes[longitudeKey])
            const latitude = parseFloat(item.attributes[latitudeKey])
            // skips item if no long or lat value is provided
            if (!isNaN(longitude) && !isNaN(latitude)){
                points.push([latitude, longitude])
            }
        }
        )
    }
    return points
}

function RemoteBubbleMap(props: Props) {
    const { endpoint, baseUrl, longitudeKey, latitudeKey, filter, height } = props;
    const [ points, setPoints ] = useState<number[][]>([]);
    const [ errorMessage, setErrorMessage ] = useState<string>('')
    const [ loading, setLoading ] = useState(true)
    const [ totalPoints, setTotalPoints ] = useState<number>(0)

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
            setTotalPoints(res.data.meta.total)
            const coordinate_data = res.data.data
            const convertedData = elasticToChartData(coordinate_data, longitudeKey, latitudeKey)
            setPoints(convertedData)
            setLoading(false)
        })
        .catch((error: any) => {
            console.error(error.message)
            setErrorMessage(error.message)
        })
    }, [filter]);

    const emptyMap = <BubbleMap {...props} points={[]} />
    
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

    if (totalPoints >= pageSize) {
        return (
            <Placeholder
                message={'Please add additional filters to visualise map...'}
                opacity={0.85}
                backing={emptyMap}
                height={height}
            />
        );
    }

    return <BubbleMap {...props} points={points} />
}

export default RemoteBubbleMap;
