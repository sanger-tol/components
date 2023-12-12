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

const RemoteObjectDetail = (props: Props) => {
    const { endpoint, filter, baseUrl, fields } = props
    const [ objectData, setObjectData ] = useState<any[]>([]);

    useEffect(() => {
        httpClient().get('/' + endpoint, {
            baseURL: baseUrl,
            params: {
                filter: filter
            }
        })
        .then((res: any) => {
            const data = res.data.data[0]

            const selectedFields = fields ? Object.fromEntries(
                Object.entries(data.attributes).filter(([key]) => fields.includes(key))
            )
            : data.attributes
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
