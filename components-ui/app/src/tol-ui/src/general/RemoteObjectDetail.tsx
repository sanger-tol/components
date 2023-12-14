/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient'
import ObjectDetail from "./ObjectDetail";
import { FieldMetaData } from "src/table/FieldMeta";

interface Props {
    endpoint: string,
    filter?: object,
    baseUrl?: string,

    fields?: FieldMetaData
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
            let selectedFields: any = {}
            if (data !== undefined) {
                // if fields are defined
                if (fields !== undefined) {
                    Object.entries(fields).forEach(([fieldKey, fieldValues]) => {
                        if (fieldKey in data.attributes) {
                            let value = data.attributes[fieldKey]
                            if (fieldValues.rename !== undefined && fieldValues.rename !== null) {
                                selectedFields[fieldValues.rename] = value
                            } else {
                                selectedFields[fieldKey] = value
                            }
                        }
                    })
                setObjectData(selectedFields)
                }
            }
        }).catch((error: any) => {
            console.warn(error.message)
            console.warn('Please ensure the db has been restored')
            console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
        })
    }, [endpoint, filter, baseUrl])

    return (
        <ObjectDetail 
        data={ objectData }
        />
    )
}

export default RemoteObjectDetail;
