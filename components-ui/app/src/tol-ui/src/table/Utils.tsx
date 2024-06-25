/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns';
import CellTooltip from './CellTooltip';
import { httpClient } from '../services/http/httpClient';
import {
  addFieldDefaults,
  CellRenderer,
  FieldMeta,
  FieldMetaData,
  initialiseFieldMeta
} from './Field';
import { isFloat, TypesMeta } from "../general/Utils";
import Relationship from './Relationship';
import { Status } from '../general';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';


export const fieldMetaVersion = "field-meta-v7";
let idField: string; // id or uid
let idFieldDefinedPreviously = false;
let hiddenFields = false;

export function isRelationship(key: string) {
  return key.includes('.');
}

export function addTotalText(totalSize: number) {
  if (totalSize === 1) {
    return "1 Row";
  // add a plus for elastic search (results cap at 10,000)
  } else if (totalSize === 10000) {
    return "10000+ Rows";
  }
  return totalSize.toString() + " Rows";
}

function createLink(text: any, url: string) {
  return <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>;
}

function createRelationshipBox(key: string, data: any, baseUrl?: string, detail?: boolean) {
  const [relationship, attribute] = key.split('.');

  // cannot assume some keys exist
  if ('relationships' in data) {
    if (relationship in data['relationships']) {
      const relationData = data['relationships'][relationship]['data'];
      // need to create attributes for id to be added to if it doesn't exist
      if (!('attributes' in relationData)) {
        relationData['attributes'] = {};
      }
      relationData['attributes']['id'] = relationData['id'];
      if (attribute in relationData['attributes']) {
        return (
          <Relationship
            attribute={attribute}
            data={relationData}
            detail={detail}
            baseUrl={baseUrl}
          />
        );
      }
    }
  }
  return "";
}

function createDate(value: string) {
  const date = new Date(value);
  const dateText = format(date, 'dd/MM/yyyy');
  const dateContents = format(date, 'dd/MM/yyyy HH:mm');
  return (
    <CellTooltip
      followCursor
      value={ dateText }
      contents={ dateContents }
    />
  );
}

function createBoolean(value: boolean) {
  switch (value) {
  case true:
    return (
      <Status
        text="True"
        status="success"
      />
    );
  case false:
    return (
      <Status
        text="False"
        status="danger"
      />
    );
  default:
    return "";
  }
}

function createImage(value: string) {
  return (
    <a href={ value } target="_blank" rel="noopener noreferrer">
      <img src={ value } alt={ value } width="30%"/>
    </a>
  );
}

function createFormattedList(list: any[]) {
  return (
    <div className='simple-tag-container'>
      {list.map((value: any) => {
        return (
          <div className='simple-tag' key={value}>
            {value}
          </div>
        );
      })}
    </div>
  );
}

function createExpander(value: string) {
  const shortValue = (
    <div className="copy-icon">
      {value.substring(0, 32) + "..."}
      <FontAwesomeIcon
        icon={faCopy}
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(value);
        }}
      />
    </div>
  );

  return (
    <CellTooltip
      value={shortValue}
      contents={value}
    />
  );
}

function createFloat(value: any) {
  return (
    <CellTooltip
      followCursor
      value={ value.toFixed(2) }
      contents={ value }
    />
  );
}

function createCellRenderer(cellRenderer: CellRenderer, key: string, value: any, data: object, baseUrl?: string) {
  if (cellRenderer === null) return value;
  if (typeof cellRenderer === 'string') {
    if (value === null || value === undefined) return "";
    if (cellRenderer === 'relationship') {
      return createRelationshipBox(key, data, baseUrl);
    } else if (cellRenderer === 'relationshipDetail') {
      return createRelationshipBox(key, data, baseUrl, true);
    } else if (cellRenderer === 'datetime') {
      return createDate(value);
    } else if (cellRenderer === 'boolean') {
      return createBoolean(value);
    } else if (cellRenderer === 'image') {
      return createImage(value);
    } else if (cellRenderer === 'list') {
      return createFormattedList(value);
    } else if (cellRenderer === 'expander') {
      return createExpander(value);
    } else if (cellRenderer === 'float') {
      return createFloat(value);
    }
  }

  const props: object = {};
  if (cellRenderer.propPointers !== undefined) {
    for (const [prop, requiredField] of Object.entries(cellRenderer.propPointers)) {
      if (requiredField === 'id') {
        props[prop] = data['id'];
      } else {
        props[prop] = data["attributes"][requiredField];
      }
    }
  }
  if (cellRenderer.props !== undefined) {
    Object.assign(props, cellRenderer.props);
  }
  // all row data always passed to use in a cellRenderer component via a rowData prop
  props["rowData"] = data;
  return <cellRenderer.element {...props}/>;
}

function setValueBasedCellRenderer(key: string, value: any, fieldMetaData: object) {
  if (fieldMetaData[key].cellRenderer === undefined) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        fieldMetaData[key].cellRenderer = 'list';
      } else if (value.length > 32) {
        fieldMetaData[key].cellRenderer = 'expander';
      } else if (isFloat(value)) {
        fieldMetaData[key].cellRenderer = 'float';
      }
    }
  }
}

function addCustomCellRendererData(fieldMetaData: any, attributes: any) {
  for (const key of Object.keys(fieldMetaData)) {
    if (typeof fieldMetaData[key].cellRenderer === 'object' && fieldMetaData[key].cellRenderer !== null) {
      attributes[key] = 'CUSTOM_FIELD';
    }
  }
  return attributes;
}

function formatAttributeData(row: object, fieldMetaData: object, rowOutput: object, baseUrl?: string) {
  const attributes = row["attributes"];
  // add non-null value for a custom field to allow cellRenderer to display
  addCustomCellRendererData(fieldMetaData, attributes);
  for (const [key, value] of Object.entries(attributes)) {
    if (fieldMetaData[key] !== undefined) {
      setValueBasedCellRenderer(key, value, fieldMetaData);
      if (fieldMetaData[key].cellRenderer !== undefined) {
        rowOutput[key] = createCellRenderer(fieldMetaData[key].cellRenderer, key, value, row, baseUrl);
      } else if (fieldMetaData[key].link !== undefined) {
        rowOutput[key] = createLink(attributes[key], attributes[fieldMetaData[key].link]);
      } else {
        rowOutput[key] = value;
      }
    }
  }
}

function addRelationshipFieldsToAttributes(row: object, fieldMetaData: FieldMetaData) {
  const rowRelationships = row["relationships"];
  const rowAttributes = row["attributes"];
  for (const [key, meta] of Object.entries(fieldMetaData)) {
    // only deal with relationships
    if (!meta.isAttribute) {
      const [relationship, attribute] = key.split('.');
      // cannot assume relationship exists
      if (relationship in rowRelationships) {
        if ("data" in rowRelationships[relationship]) {
          const instanceData = rowRelationships[relationship]["data"];
          if (attribute === "id") {
            rowAttributes[key] = instanceData["id"];
            continue;
          } else if ("attributes" in instanceData && attribute in instanceData["attributes"]) {
            rowAttributes[key] = instanceData["attributes"][attribute];
            continue;
          }
        }
      }
      // if row doesn't have the fields data, default to null
      rowAttributes[key] = null;
    }
  }
}

export function convertTableData(data: any[], fieldMeta: FieldMeta, baseUrl?: string) {
  if (data[0] === undefined) return [];
  
  const updatedData: any[] = [];
  data.forEach(row => {
    if ('relationships' in row) {
      addRelationshipFieldsToAttributes(
        row,
        fieldMeta.data
      );
    }
    const rowOutput = {'id': row.id};
    if ('attributes' in row) {
      formatAttributeData(
        row,
        fieldMeta.data,
        rowOutput,
        baseUrl
      );
    }
    updatedData.push(rowOutput);
  });
  return updatedData;
}

function addDefaultCellRenderer(key: string, type: string) {
  // relationship ids have relationship boxes by default
  if (isRelationship(key) && key.split('.')[1] === 'id') {
    return 'relationship';
  }
  switch(type) {
  case 'datetime':
  case 'boolean':
    return type;
  }
  return undefined;
}

function structureFieldMetaViaProp(endpoint: string, fieldMeta: FieldMeta, fields: FieldMetaData) {
  for (const [key, meta] of Object.entries(fields)) {
    const isActive = (meta.hidden) ? 'inactive' : 'active';
    fieldMeta.order[isActive].push(key);
    fieldMeta.data[key] = addFieldDefaults(meta, key, endpoint);
    fieldMeta.data[key].isAttribute = !isRelationship(key);
    if (fieldMeta.data[key].hidden) hiddenFields = true;
  }
}

function addRelationshipsAttributes(endpoint: string, typesMeta: TypesMeta) {
  // checking if current object and one relations exist
  if (endpoint in typesMeta.relationships) {
    if ("one" in typesMeta.relationships[endpoint]) {
      for (const [relationship, objectType] of Object.entries(typesMeta.relationships[endpoint].one!)) {
        typesMeta.attributes[endpoint][relationship + ".id"] = {
          available_on_relationships: true,
          python_type: "str"
        };
        // relations are mentioned multiple times due to different data origins
        for (const [key, meta] of Object.entries(typesMeta.attributes[objectType])) {
          // add the relations attribute and its type
          if (meta["available_on_relationships"]) {
            const relationKey = relationship + "." + key;
            typesMeta.attributes[endpoint][relationKey] = meta;
          }
        }
      }
    }
  }
}

function addRemoteFilterType(type: string, cardinality: number) {
  if (cardinality && cardinality < 20 && type === 'str') return 'multi';
  if (type === 'double') return 'float';
  return type;
}

function addRemoteTypesAndExtraColumns(
  endpoint: string,
  fieldMeta: FieldMeta,
  typesMeta: TypesMeta,
  fieldPropExists: boolean
) {
  idFieldDefinedPreviously = idField in fieldMeta.data;
  for (const [key, meta] of Object.entries(typesMeta.attributes[endpoint])) {
    let hidden = fieldPropExists;
    let isActive = hidden ? 'inactive' : 'active';
    const type = meta['python_type'];
    const filterType = addRemoteFilterType(type, meta['cardinality']);

    // auto add field that are not yet in fieldMeta
    if (!hiddenFields && !(key in fieldMeta.data)) {
      // relationship attributes are hidden by default
      if (isRelationship(key) && key.split('.')[1] !== 'id') {
        hidden = true;
        isActive = 'inactive';
      }
      if (key !== idField) fieldMeta.order[isActive].push(key);
      fieldMeta.data[key] = addFieldDefaults(
        // hidden as default, overridden by field prop
        {isAttribute: !isRelationship(key), hidden: hidden},
        key,
        endpoint
      );
    }
    // add deafults to type/filter/sort fields
    if (key in fieldMeta.data) {
      if (fieldMeta.data[key].type === undefined) {
        fieldMeta.data[key].type = type;
      }
      if (fieldMeta.data[key].filter === undefined) {
        fieldMeta.data[key].filter = filterType;
      }
      if (fieldMeta.data[key].sort === undefined) {
        fieldMeta.data[key].sort = true;
      }
    }
  }
}

function addDefaultMeta(
  fieldMeta: FieldMeta,
  fieldPropExists: boolean
) {
  // add defaults
  for (const [key, meta] of Object.entries(fieldMeta.data)) {
    if (fieldMeta.data[key].cellRenderer === undefined) {
      fieldMeta.data[key].cellRenderer = addDefaultCellRenderer(key, meta.type!);
    }
  }
  // ensure fields are easy to find
  fieldMeta.order.inactive.sort();
  // id shoud be first in the order (initial load) and no hidden fields defined
  if (idField !== undefined && !idFieldDefinedPreviously && !hiddenFields) {
    const isActive = fieldPropExists ? 'inactive' : 'active';
    fieldMeta.order[isActive].unshift(idField);
  }
}

export function structureFieldMeta(endpoint: string, typesMeta?: TypesMeta, fields?: FieldMetaData) {
  const fieldMeta = initialiseFieldMeta();
  const fieldPropExists = fields !== undefined;
  if (fieldPropExists) {
    structureFieldMetaViaProp(endpoint, fieldMeta, fields);
  }
  /*
  --- dealing with id/uid ---
  - id is seperate from attributes, so it needs to be added
  - only added if uid does not exist
  - value can be null, as only the key is used in this instance
  */
  if (typesMeta !== undefined) {
    idField = ('uid' in typesMeta.attributes[endpoint]) ? 'uid' : 'id';
    typesMeta.attributes[endpoint][idField] = {
      available_on_relationships: true,
      python_type: "str"
    };
    addRelationshipsAttributes(endpoint, typesMeta);
    addRemoteTypesAndExtraColumns(endpoint, fieldMeta, typesMeta, fieldPropExists);
  }
  addDefaultMeta(fieldMeta, fieldPropExists);
  return fieldMeta;
}

export function tableDebug(apiData: object, fieldMeta: object, debug?: boolean) {
  if (debug) {
    try {
      const fieldPossibilities: any = {
        'attributes': ['id'],
        'relationships': []
      };
      const apiDataInstance = apiData[0];
      if ('attributes' in apiDataInstance) {
        for (const key of Object.keys(apiDataInstance.attributes)) {
          fieldPossibilities['attributes'].push(key);
        }
      }
      const relationships: object = apiDataInstance.relationships;
      if ('relationships' in apiDataInstance) {
        for (const [key, value] of Object.entries(relationships)) {
          // ignoring one-to-many relationships
          if ('data' in value) {
            fieldPossibilities['relationships'].push(key);
          }
        }
      }
      console.log('Field Possibilities', fieldPossibilities);
      console.log('Api Response Data', apiData);
      console.log('Field Meta', fieldMeta);
    } catch(e) {} // eslint-disable-line
  }
}

export function createSort(sortColumn: string, sortType: string) {
  if (sortType === 'desc') {
    return "-" + sortColumn;
  }
  return sortColumn;
}

export function setFieldMetaAttributeInStorage(tableId: string, value: any, attribute?: string) {
  if (attribute === undefined) {
    localStorage.setItem(`${tableId}-${fieldMetaVersion}`, JSON.stringify(value));
  } else {
    const fieldMeta = JSON.parse(localStorage.getItem(`${tableId}-${fieldMetaVersion}`)!);
    fieldMeta[attribute] = value;
    localStorage.setItem(`${tableId}-${fieldMetaVersion}`, JSON.stringify(fieldMeta));
  }
}

export function getFieldMetaAttributeFromStorage(tableId: string, fields?: FieldMetaData, attribute?: string) {
  const data = localStorage.getItem(`${tableId}-${fieldMetaVersion}`);
  if (data !== null) {
    let fieldMeta = JSON.parse(data);
    if (attribute !== undefined) {
      return fieldMeta[attribute];
    } else if (fields !== undefined) {
      fieldMeta = fieldMetaToCellRenderer(fields, fieldMeta);
    }
    return fieldMeta;
  }
  return null;
}

export function deleteFieldMetaFromStorage(tableId: string) {
  localStorage.removeItem(`${tableId}-${fieldMetaVersion}`);
  window.location.reload();
}

export function fieldMetaToCellRenderer(fields: FieldMetaData, fieldMeta: FieldMeta) {
  for (const field in fields) {
    if (fields[field].cellRenderer){
      fieldMeta.data[field].cellRenderer = fields[field].cellRenderer;
    }
  }
  return fieldMeta;
}

export function exportTableToSpreadsheet(
  endpoint: string,
  fieldMetaData: FieldMetaData,
  filter: object,
  sortColumn: string,
  sortType: string,
  setSuccess: any,
  setError: any,
  setDownloading: any,
  defaultSort?: string,
  baseUrl?: string
) {
  setDownloading(true);

  const columns = Object.keys(fieldMetaData).map((key: string) => ({
    key: key,
    display_name: fieldMetaData[key].rename,
    hidden: fieldMetaData[key].hidden
  }));

  const params = {
    page_size: 10000,
    filter: filter
  };

  // deal with sorting
  if (sortColumn !== '') {
    params['sort_by'] = createSort(sortColumn, sortType);
  } else if (defaultSort !== undefined) {
    params['sort_by'] = defaultSort;
  }

  httpClient().post('/' + endpoint + ':export',
    { data: columns }, {
      params: params,
      baseURL: baseUrl,
      responseType: 'blob'
    })
    .then((res: any) => {
    // temporary URL for the blob
      const tempUrl = window.URL.createObjectURL(res.data);

      // Trigger the download with an anchor element
      const a = document.createElement('a');
      a.href = tempUrl;
      a.download = endpoint + '_table.xlsx';
      a.click();

      // Release the URL
      window.URL.revokeObjectURL(tempUrl);
      setDownloading(false);

      if (res.status !== 200) throw Error();

      setDownloading(false);
      setSuccess('Download Completed');
    }).catch((error: any) => {
      setDownloading(false);
      setError("Download Failed: " + error.message);
    });
}
