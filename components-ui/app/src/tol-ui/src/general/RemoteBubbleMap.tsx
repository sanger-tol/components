/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import BubbleMap from "./BubbleMap";
import Status from "./Status";
import { httpClient } from "../services/http/httpClient";


interface Props {
    endpoint: string,
    baseUrl?: string,
    longitudeKey: string
    latitudeKey: string
    height: number
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
    elasticData.forEach((item) => {
        const longitude = parseFloat(item.attributes[longitudeKey]);
        const latitude = parseFloat(item.attributes[latitudeKey])
        points.push([longitude, latitude])
        }
    )
    return points
}

function RemoteBubbleMap(props: Props) {
    const { endpoint, baseUrl, longitudeKey, latitudeKey } = props;
    const [ points, setPoints ] = useState<number[][]>([]);
    const [ errorMessage, setErrorMessage ] = useState<string>('')

    useEffect(() => {
        httpClient().get('/' + endpoint, {baseURL: baseUrl})
        .then((res: any) => {
            const coordinate_data = res.data.data
            const convertedData = elasticToChartData(coordinate_data, longitudeKey, latitudeKey)
            setPoints(convertedData)
        })
        .catch((error: any) => {
            console.error(error.message)
            setErrorMessage(error.message)
        })
    }, []);

    if( errorMessage === ''){
        return (
            <div>
                <BubbleMap
                    {...props}
                    points={ points}
                />
            </div>
        );
    }else{
        return (
            <div>
                <Status
                status="danger"
                text={errorMessage}
            />
                <BubbleMap
                    {...props}
                    points={ points}
                />
            </div>
        )
    }
}

export default RemoteBubbleMap;
