/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Currently not in use

import { useState, useEffect } from 'react';
import { httpClient } from '../services/http/httpClient';
import ObjectDetail from "./ObjectDetail";
import { FieldMetaData } from "../table/Field";
import { formatDate, normaliseCaps } from "./Utils";

interface Props {
  endpoint: string,
  id: string,
  fields: FieldMetaData,
  baseUrl?: string,
  setData?: any
}

const formatContents = (contents: object) => {
  const updatedContents: any = {};
  for (const [key, value] of Object.entries(contents)) {
    // format keys
    const formattedKey = normaliseCaps(key);

    // format values if date or boolean
    let formattedValue = value;
    if (typeof value === 'string' && value.includes('GMT')) {
      formattedValue = formatDate(value);
    }
    if (typeof value === 'boolean') {
      formattedValue = value.toString();
    }
    
    updatedContents[formattedKey] = formattedValue;
  }
  return updatedContents;
};

const RemoteObjectDetail = (props: Props) => {
  const { endpoint, id, baseUrl, fields, setData } = props;
  const [objectData, setObjectData] = useState<any[]>([]);

  useEffect(() => {
    httpClient().get('/' + endpoint + '/' + id, {
      baseURL: baseUrl
    })
      .then((res: any) => {
        const data = res.data.data;
        let selectedFields: any = {};
        // if specified, set data to all that's been returned by the call
        if (data !== undefined) {
          if (setData !== undefined) {
            setData(data);
          }
          // set the state with all returned data
          Object.entries(fields).forEach(([fieldKey, fieldValues]) => {
            if (fieldKey in data.attributes) {
              const value = data.attributes[fieldKey];
              // rename the field if rename value provided
              if (fieldValues.rename !== undefined && fieldValues.rename !== null) {
                selectedFields[fieldValues.rename] = value;
              } else {
                selectedFields[fieldKey] = value;
              }
            } else {
              console.warn(`Field '${fieldKey}' is missing in the data attributes.`);
            }
          });
          selectedFields = formatContents(selectedFields);
          setObjectData(selectedFields);
        }
      }).catch((error: any) => {
        console.warn(error.message);
        console.warn('Please ensure the db has been restored');
        console.warn('Please ensure the \'endpoint\' prop is correct and pluralised');
        console.warn('Please ensure the \'fields\' prop is provided');
      });
  }, [endpoint, id, baseUrl]);

  return (
    <ObjectDetail 
      data={ objectData }
    />
  );
};

export default RemoteObjectDetail;
