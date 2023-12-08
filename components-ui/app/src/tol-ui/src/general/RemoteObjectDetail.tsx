/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient'
import ObjectDetail from "./ObjectDetail";

interface Props {
    endpoint: string,
    filter?: object,
    baseUrl?: string,

    fields?: any[]
}

function generateFilter(filter?: object | null): object | null {
    if (filter !== undefined && filter !== null) {
        return {
            contains: filter
        }
    } else {
        return null
    }
}

const RemoteObjectDetail = (props: Props) => {
    const { endpoint, filter, baseUrl, fields } = props
    const [ objectData, setObjectData ] = useState<any[]>([]);

    useEffect(() => {
        httpClient().get('/' + endpoint, {
            baseURL: baseUrl,
            params: {
                filter: generateFilter(filter) || undefined
            }
        })
        .then((res: any) => {
            const data = res.data.data[0].attributes

            const selectedFields = fields ? Object.fromEntries(
                Object.entries(data).filter(([key]) => fields.includes(key))
            )
            : data
            setObjectData(selectedFields)
        })
    }, [endpoint, filter, baseUrl])

    return (
        <ObjectDetail 
        data={objectData}
        />
    )
}

export default RemoteObjectDetail;
