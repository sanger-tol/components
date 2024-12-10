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
import { isFloat, normaliseCaps } from "../general/Utils";
import Relationship from './Relationship';
import { Status } from '../general';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { EntityMeta } from '../models';


interface Rgb {
  [key: string]: number,
  r: number,
  g: number,
  b: number
}

export const tableVersion = "table-v12";
let hiddenFields = false;

export function isRelationship(key: string) {
  return key.includes('.');
}

const sourceColours = {
  'sts': {r: 6, g: 11, b: 163},
  'benchling': {r: 25, g: 143, b: 31},
  'mlwh': {r: 32, g: 155, b: 240},
  'grit': {r: 213, g: 26, b: 54},
  'goat': {r: 203, g: 107, b: 12},
  'informatics': {r: 0, g: 0, b: 0},
  'bold': {r: 134, g: 186, b: 1},
  'treeofsex': {r: 153, g: 0, b: 199},
  'tolid': {r: 199, g: 0, b: 83},
  'tolqc': {r: 17, g: 93, b: 10},
  'tolqclegacy': {r: 181, g: 178, b: 22},
  'portaldb': {r: 234, g: 34, b: 181},
  'pantheon': {r: 190, g: 190, b: 190},
  'calculated': {r: 0, g: 207, b: 131},
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

function addCustomCellRendererData(fieldMetaData: FieldMetaData, attributes: any) {
  for (const key of Object.keys(fieldMetaData)) {
    if (fieldMetaData[key].custom) {
      attributes[key] = 'CUSTOM_FIELD';
    }
  }
  return attributes;
}

function formatAttributeData(row: object, fieldMetaData: FieldMetaData, rowOutput: object, baseUrl?: string) {
  const attributes = row["attributes"];
  // add non-null value for a custom field to allow cellRenderer to display
  addCustomCellRendererData(fieldMetaData, attributes);
  for (const [key, value] of Object.entries(attributes)) {
    if (fieldMetaData[key] !== undefined) {
      setValueBasedCellRenderer(key, value, fieldMetaData);
      if (fieldMetaData[key].cellRenderer !== undefined) {
        rowOutput[key] = createCellRenderer(fieldMetaData[key].cellRenderer!, key, value, row, baseUrl);
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
      if (relationship in rowRelationships && rowRelationships[relationship]) {
        if ("data" in rowRelationships[relationship]) {
          const instanceData = rowRelationships[relationship]["data"];
          if (attribute === "id") {
            rowAttributes[key] = instanceData["id"];
          } else if ("attributes" in instanceData && attribute in instanceData["attributes"]) {
            rowAttributes[key] = instanceData["attributes"][attribute];
          }
        }
      }
      // if row doesn't have the fields data, default to null
      if (!rowAttributes[key]) rowAttributes[key] = null;
    }
  }
}

export function convertTableData(data: any[], fieldMeta: FieldMeta, baseUrl?: string) {
  if (data[0] === undefined) return [];
  
  const updatedData: any[] = [];
  data.forEach(row => {
    // create empty attributes if they don't exist
    if (!('attributes' in row)) row['attributes'] = {};
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

function structureFieldMetaViaProp(fieldMeta: FieldMeta, fields: FieldMetaData) {
  for (const [key, meta] of Object.entries(fields)) {
    // only adding field if it is new or first load
    if (!(key in fieldMeta.data)) {
      const isActive = (meta.hidden) ? 'inactive' : 'active';
      fieldMeta.order[isActive].push(key);
    }
    fieldMeta.data[key] = addFieldDefaults(meta);
    fieldMeta.data[key].isAttribute = !isRelationship(key);
    if (fieldMeta.data[key].hidden) hiddenFields = true;
  }
}

function addRemoteFilterType(type: string, cardinality: number) {
  if (cardinality && cardinality < 20 && type === 'str') return 'multi';
  if (type === 'double') return 'float';
  return type;
}

function addEntityMetaFields(
  endpoint: string,
  fieldMeta: FieldMeta,
  entityMeta: EntityMeta
) {
  for (const [key, meta] of Object.entries(entityMeta.flatAttributes[endpoint])) {
    // initialising
    const type = meta['python_type'];
    const rename = meta['display_name'];
    const description = meta['description'] || undefined;
    const filterType = addRemoteFilterType(type, meta['cardinality']);
    const source = meta['source'];

    // auto add field that are not yet in fieldMeta & hidden not enabled
    if (!hiddenFields && !(key in fieldMeta.data)) {
      fieldMeta.order['inactive'].push(key);
      fieldMeta.data[key] = addFieldDefaults(
        // hides any new (not defined as a prop) fields
        {isAttribute: !isRelationship(key), hidden: true}
      );
    }
    // add defaults to fields
    if (key in fieldMeta.data) {
      fieldMeta.data[key].type = fieldMeta.data[key].type || type;
      fieldMeta.data[key].filter = fieldMeta.data[key].filter || filterType;
      fieldMeta.data[key].sort = fieldMeta.data[key].sort || true;
      fieldMeta.data[key].rename = fieldMeta.data[key].rename || rename || normaliseCaps(key, endpoint);
      fieldMeta.data[key].description = fieldMeta.data[key].description || description;
      fieldMeta.data[key].source = fieldMeta.data[key].source || source;
    }
  }
}

export function sortFieldsByRename(fieldMeta: FieldMeta) {
  return fieldMeta.order.inactive.sort((a, b) => {
    const fieldA = fieldMeta.data[a];
    const fieldB = fieldMeta.data[b];
    if (fieldA.rename! < fieldB.rename!) return -1;
    if (fieldA.rename! > fieldB.rename!) return 1;
    return 0;
  });
}

function addDefaultMeta(
  fieldMeta: FieldMeta
) {
  // add defaults
  for (const [key, meta] of Object.entries(fieldMeta.data)) {
    if (fieldMeta.data[key].cellRenderer === undefined) {
      fieldMeta.data[key].cellRenderer = addDefaultCellRenderer(key, meta.type!);
    }
  }
  // ensure fields are easy to find
  fieldMeta.order.inactive = sortFieldsByRename(fieldMeta);
}

export function structureFieldMeta(
  endpoint: string,
  savedFieldMeta?: FieldMeta,
  entityMeta?: EntityMeta,
  fields?: FieldMetaData
) {
  endpoint = endpoint.split('/').pop() as string;
  const fieldMeta = savedFieldMeta || initialiseFieldMeta();
  const fieldPropExists = fields !== undefined;
  if (fieldPropExists) structureFieldMetaViaProp(fieldMeta, fields);
  /*
  --- dealing with id/uid ---
  - id is seperate from attributes, so it needs to be added
  - only added if uid does not exist
  - value can be null, as only the key is used in this instance
  */
  if (entityMeta) {
    addEntityMetaFields(endpoint, fieldMeta, entityMeta);
  }
  addDefaultMeta(fieldMeta);
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

export function setTableConfigLocalStorage(tableId: string, key: string, value: any) {
  localStorage.setItem(`${key}-${tableId}-${tableVersion}`, JSON.stringify(value));
}

export function getTableConfigLocalStorage(tableId: string, key: string) {
  const data = localStorage.getItem(`${key}-${tableId}-${tableVersion}`);
  if (data) return JSON.parse(data);
}

export function getFieldMetaLocalStorage(tableId: string, fields?: FieldMetaData) {
  const data = localStorage.getItem(`fieldMeta-${tableId}-${tableVersion}`);
  if (data) return fieldMetaToCellRenderer(fields || {}, JSON.parse(data));
}

export function deleteFieldMetaLocalStorage(tableId: string) {
  localStorage.removeItem(`${tableId}-${tableVersion}`);
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
    hidden: fieldMetaData[key].hidden || false
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

function rgbToString(rgb: Rgb, opacity: number) {
  return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity.toString() + ")";
}

export function getSourceColour(sourceName: string) {
  const rgb = sourceColours[sourceName];
  if (rgb === undefined) return rgbToString({r: 77, g: 77, b: 77}, 1);
  return rgbToString(rgb, 1);
}
