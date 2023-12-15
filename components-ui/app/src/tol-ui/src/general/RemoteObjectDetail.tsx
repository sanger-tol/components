/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient'
import ObjectDetail from "./ObjectDetail";
import { FieldMetaData } from "src/table/FieldMeta";
import { formatDate, normaliseCaps } from "./Utils";

interface Props {
    endpoint: string,
    filter?: object,
    baseUrl?: string,

    fields: FieldMetaData
}

const formatContents = (contents: object) => {
    const updatedContents: any = {}

    for (const [key, value] of Object.entries(contents)) {
      // remove or format some content
      if (typeof value === 'string' && value.includes('GMT')) {
        updatedContents[key] = formatDate(value)
      }
      if (typeof value === 'boolean') {
        updatedContents[key] = value.toString()
      }
      const formattedKey = normaliseCaps(key)
      if (formattedKey !== key) {
        updatedContents[formattedKey] = value
      } else {
        updatedContents[key] = value
      }
    }
    return updatedContents
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
                        throw new Error(`Field '${fieldKey}' is missing in the data attributes.`)
                    }
                })
                selectedFields = formatContents(selectedFields)
                setObjectData(selectedFields)
            }
        }).catch((error: any) => {
            console.warn(error.message)
            console.warn('Please ensure the db has been restored')
            console.warn('Please ensure the \'endpoint\' prop is correct and pluralised')
            console.warn('Please ensure the provide the \'fields\' prop')
        })
    }, [endpoint, filter, baseUrl])

    return (
        <ObjectDetail 
        data={ objectData }
        />
    )
}

export default RemoteObjectDetail;
