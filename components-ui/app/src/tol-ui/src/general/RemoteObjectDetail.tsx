/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, React } from "react";
import { httpClient } from '../services/http/httpClient'
import ObjectDetail from "./ObjectDetail";
import { FieldMetaData } from "../table/FieldMeta";
import { formatDate, normaliseCaps } from "./Utils";

interface Props {
    endpoint: string,
    fields: FieldMetaData
    filter?: object,
    baseUrl?: string,
    setData?: React.Dispatch<React.SetStateAction<any>>
}

const formatContents = (contents: object) => {
    const updatedContents: any = {}
    for (const [key, value] of Object.entries(contents)) {
        // format keys
        const formattedKey = normaliseCaps(key)

        // format values if date or boolean
        let formattedValue = value
        if (typeof value === 'string' && value.includes('GMT')) {
            formattedValue = formatDate(value)
        }
        if (typeof value === 'boolean') {
            formattedValue = value.toString()
        }
    
        updatedContents[formattedKey] = formattedValue
    }
    return updatedContents
  }

const RemoteObjectDetail = (props: Props) => {
    const { endpoint, filter, baseUrl, fields, setData } = props
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
            // if specified, set data to all that's been returned by the call
            if (data !== undefined) {
                if (setData) {
                    setData(data)
                }
                // set the state with all returned data
                Object.entries(fields).forEach(([fieldKey, fieldValues]) => {
                    if (fieldKey in data.attributes) {
                        let value = data.attributes[fieldKey]
                        // rename the field if rename value provided
                        if (fieldValues.rename !== undefined && fieldValues.rename !== null) {
                            selectedFields[fieldValues.rename] = value
                        } else {
                            selectedFields[fieldKey] = value
                        }
                    } else {
                        console.warn(`Field '${fieldKey}' is missing in the data attributes.`)
                    }
                })
                selectedFields = formatContents(selectedFields)
                setObjectData(selectedFields)
            }
        }).catch((error: any) => {
            console.warn(error.message)
            console.warn('Please ensure the db has been restored')
            console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
            console.warn('Please ensure the \'fields\' prop is provided')
        })
    }, [endpoint, filter, baseUrl])

    return (
        <ObjectDetail 
        data={ objectData }
        />
    )
}

export default RemoteObjectDetail;
