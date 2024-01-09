/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns';
import CellTooltip from './CellTooltip';
import { httpClient } from '../services/http/httpClient';
import { addFieldDefaults,
  CellRenderer,
  // Field,
  FieldMeta,
  FieldMetaData } from './Field';
import { getConfig } from "../general/Utils";


export const fieldMetaVersion = "field-meta-v3";
let idField = ''; // id or uid

// types meta
interface Attributes {
  [id: string]: object
}

interface Relationships {
  [id: string]: Relationship
}

interface Relationship {
  one?: Values,
  many?: Values,
  foreign_keys?: Values
}

interface Values {
  [id: string]: string
}

interface TypesMeta {
  attributes: Attributes,
  relationships: Relationships
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

function checkAndConvertDate(text: string) {
  const date = new Date(text);
  // if num - return text as a num can be converted to date incorrectly
  if (date.toLocaleDateString("en-US") === 'Invalid Date' ||
      !isNaN(Number(text))) {
    return <>{text}</>;
  } else {
    const dateText = format(date, 'dd/MM/yyyy');
    const dateContents = format(date, 'dd/MM/yyyy HH:mm');
    return <CellTooltip
      text={ dateText }
      contents={ dateContents }
    />;
  }
}

export function checkAndAutoConvertText(text: any, type?: string) {
  // stringify booleans
  if (type === 'boolean') return text ? 'True' : !text ? 'False' : '';
  try {
    new URL(text); // fails if not link
    // eslint-disable-next-line
    const linkRegEx = /^https?:\/\/([^\/]*).*/
    const imgRegEx = /.*\.(?:png|jpg|jpeg)/i;
    if (imgRegEx.test(text.toLowerCase())) {
      return <a href={ text } target="_blank" rel="noopener noreferrer">
        <img src={ text } alt={ text } width="30%"/>
      </a>;
    }
    const uiUrl = text.replace(linkRegEx, '$1');
    return <a href={text} target="_blank" rel="noopener noreferrer">
      {uiUrl}
    </a>;
  } catch {
    return checkAndConvertDate(text);
  }
}

function createLink(text: any, url: string) {
  return <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>;
}

export function createCellRenderer(cellRenderer: CellRenderer, data: object) {
  const propPointers: object = {};
  for (const [prop, requiredColumn] of Object.entries(cellRenderer.propPointers)) {
    if (requiredColumn.includes('.')) {
      const splitKey = requiredColumn.split('.');
      const relationship = splitKey[splitKey.length-2];
      const attribute = splitKey[splitKey.length-1];
      propPointers[prop] = data[relationship][attribute];
    } else {
      propPointers[prop] = data[requiredColumn];
    }
  }
  return <cellRenderer.element {...propPointers}/>;
}

export async function getTypesMeta(baseUrl?: string) {
  return {
    attributes: await getConfig('attribute_types', baseUrl),
    relationships: await getConfig('relationships', baseUrl)
  } as TypesMeta;
}

function formatAttributeData(data: object, fieldMetaData: object) {
  const updatedData: object = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldMetaData[key] !== undefined) {
      const linkField = fieldMetaData[key].link;
      const cellRendererField = fieldMetaData[key].cellRenderer;

      if (cellRendererField !== null) {
        updatedData[key] = createCellRenderer(cellRendererField, data);
      } else if (linkField !== null) {
        updatedData[key] = createLink(value, data[linkField]);
      } else {
        updatedData[key] = checkAndAutoConvertText(value, fieldMetaData[key].type);
      }
    }
  }
  return updatedData;
}

/*
function splitRelationshipKeys(fieldMeta: object) {
  const relationshipKeys = {};
  for (const key of Object.keys(fieldMeta)) {
    if (fieldMeta[key]['isAttribute'] === false) {
      const splitKey: string[] = key.split('.');
      relationshipKeys[key] = splitKey;
    }
  }
  return relationshipKeys;
}

function getRelationData(
  relationships: object,
  key: string,
  splitKey: string[],
  firstRelation: string,
  attributes: object,
  fieldMetaData: object,
  baseUrl?: string
) {
  // creating the link
  const relData = relationships[firstRelation].data
  const relLink = "/" + relData.type + "/" + relData.id.toString()

  // only the attribute part if one exists
  const attribute = splitKey[splitKey.length-1];

  // relationship box boolean
  const relationshipBox = fieldMetaData[key].relationshipBox;

  // 
  if (!relationshipBox) {
    try {
      const relationAttributes = relationships[firstRelation].data.attributes
      if (attribute in relationAttributes) {
        return checkAndAutoConvertText(
          relationAttributes[attribute]
        );
      }
    } catch (error: any) {
      console.warn("Error occured getting '" + attribute + "'");
    }
  }

  return relData.id

  // id is returned on the relationship part of the json-api
  if (attribute === 'id' && !relationshipBox) {
    return relData.id;
  } else {
    return (
      <Relationship
        initialEndpoint={ relLink }
        relationships={ splitKey }
        attributes={ attributes }
        fieldMeta={ fieldMetaData[key] }
        baseUrl={ baseUrl }
      />
    );
  }
}

function formatRelationshipData(
  relationships: object,
  attributes: object,
  fieldMetaData: object,
  baseUrl?: string
) {
  const updatedData: object = {};
  const relationshipKeys: object = splitRelationshipKeys(fieldMetaData);
  for (const [key, splitKey] of Object.entries(relationshipKeys)) {
    // current object
    const firstRelation = splitKey[0]
    // checking relationship object is correct
    if (relationships[firstRelation] === undefined) {
      throw Error('\'' + key + '\' is not a correct relationship object. ' +
                  'Please check your spelling and pluralisation.');
    }
    // ignoring one-to-many relationships
    if ('data' in relationships[firstRelation]) {
      const headingId = splitKey.join('.')

      updatedData[headingId] = getRelationData(
        relationships,
        key,
        splitKey,
        firstRelation,
        attributes,
        fieldMetaData,
        baseUrl
      );
    }
  }
  return updatedData;
}
*/

// @ts-ignore
export function convertTableData(data: any[], fieldMeta: FieldMeta, baseUrl?: string) { // eslint-disable-line
  const updatedData: any[] = [];
  data.forEach(row => {
    let fieldData = {'id': row.id};
    if ('attributes' in row) {
      const attributes = formatAttributeData(
        row.attributes,
        fieldMeta.data
      );
      fieldData = Object.assign(fieldData, attributes);
    }

    /*
    if ('relationships' in row) {
      const relationships = formatRelationshipData(
        row.relationships,
        fieldData, // attributes
        fieldMeta.data,
        baseUrl
      );
      fieldData = Object.assign(fieldData, relationships);
    }
    */
    updatedData.push(fieldData);
  });
  return updatedData;
}

function convertTypeToDefaultFilter(type: string) {
  switch(type) {
  case 'str':
  case 'int':
  case 'float':
    return 'contains';
  case 'datetime':
    return 'range';
  default:
    return null;
  }
}

function defineField(
  key: string,
  hidden: boolean,
  type: string,
  endpoint?: string
) {
  const field = addFieldDefaults(
    key,
    {
      isAttribute: !key.includes('.'),
      hidden: hidden,
      type: type,
      filterType: convertTypeToDefaultFilter(type)
    },
    endpoint
  );
  return field;
}

export function structureFieldMeta(endpoint: string, fieldMeta: FieldMeta, typesMeta: TypesMeta, fields?: FieldMetaData) {
  const fieldPropExists = fields !== undefined;
  const isActive = fieldPropExists ? 'inactive' : 'active';
  if (fieldPropExists) {
    structureFieldMetaUsingProp(endpoint, fieldMeta, fields);
  }

  /*
  --- dealing with id/uid ---
  - id is seperate from attributes, so it needs to be added
  - only added if uid does not exist
  - value can be null, as only the key is used in this instance
  */
  idField = ('uid' in typesMeta.attributes[endpoint]) ? 'uid' : 'id';
  typesMeta.attributes[endpoint][idField] = 'str';

  if (!(idField in fieldMeta.data) || !fieldPropExists) {
    // id shoud be first in the order - only initial load
    fieldMeta.order[isActive].push(idField);
  }

  addRelationshipsAttributes(endpoint, typesMeta);
  structureFieldMetaAuto(endpoint, fieldMeta, typesMeta, fieldPropExists, isActive);
  return fieldMeta;
}

function structureFieldMetaUsingProp(endpoint: string, fieldMeta: FieldMeta, fields: FieldMetaData) {
  for (const [key, meta] of Object.entries(fields)) {
    fieldMeta.order.active.push(key);
    fieldMeta.data[key] = addFieldDefaults(key, meta, endpoint);
    fieldMeta.data[key].isAttribute = !key.includes('.');
  }
}

function structureFieldMetaAuto(
  endpoint: string,
  fieldMeta: FieldMeta,
  typesMeta: TypesMeta,
  fieldPropExists: boolean,
  isActive: string
) {
  for (const [key, type] of Object.entries(typesMeta.attributes[endpoint])) {
    // only add extra fields coming from the api if field prop is defined
    if (key in fieldMeta.data) {
      fieldMeta.data[key].type = type;
      fieldMeta.data[key].filterType = convertTypeToDefaultFilter(type);
    } else {
      if (key !== idField) fieldMeta.order[isActive].push(key);

      fieldMeta.data[key] = defineField(
        key,
        fieldPropExists, // hidden as default, overridden by field prop
        type, // python data type
        endpoint
      );
    }
  }
}

function addRelationshipsAttributes(endpoint: string, typesMeta: TypesMeta) {
  const relationExists: string[] = [];
  // checking if there is 'one' relations
  if ("one" in typesMeta.relationships[endpoint]) {
    for (const relation of Object.values(typesMeta.relationships[endpoint].one!)) {
      // relations are mentioned multiple times due to different data origins
      if (relationExists.includes(relation)) {
        // add idField
        typesMeta.attributes[endpoint][relation + "." + idField] = 'str';
        for (const [key, types] of Object.entries(typesMeta.attributes[relation])) {
          // add the relations attribute and its type
          const relationKey = relation + "." + key;
          typesMeta.attributes[endpoint][relationKey] = types;
        }
      }
      relationExists.push(relation);
    }
  }
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
  setSuccess: Function, // eslint-disable-line
  setError: Function, // eslint-disable-line
  setDownloading: Function, // eslint-disable-line
  baseUrl?: string
) {
  setDownloading(true);

  const columns = Object.keys(fieldMetaData).map((key: string) => ({
    text: key,
    dataField: fieldMetaData[key].rename,
    hidden: fieldMetaData[key].hidden
  }));

  const params = {
    page: -1,
    page_size: 5000,
    filter: filter
  };

  if (sortColumn !== '') {
    params['sort_by'] = createSort(sortColumn, sortType);
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
      a.download = 'table_download.xlsx';
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
