/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { customFilter } from 'react-bootstrap-table2-filter';
import DatePicker from './DatePicker';
import TextInput from './TextInput';
import { format } from 'date-fns'
import RelationshipLink from './RelationshipLink';
import CellTooltip from './CellTooltip';
import NoDataAlert from "./NoDataAlert";
import TableErrorAlert from './TableErrorAlert';
import { addFieldDefaults,
         CellRenderer,
         FieldMeta,
         initialiseFieldMeta } from './FieldMeta';


export const fieldMetaVersion = "field-meta-v1"

export function addPlus(totalSize: number) {
  // add a plus for elastic search (results cap at 10,000)
  if (totalSize === 10000) return "+"
  return ""
}

function isEmptyOrNull(x: string) {
  return x === '' || x === null;
}

export function isEmptyObj(x: object) {
  return Object.keys(x).length === 0;
}

function initialiseFilterDict(apiFilters: object, filterType: string) {
  if (!(filterType in apiFilters)) {
    apiFilters[filterType] = {}
  }
  return apiFilters;
}

function formatDateRange(dateRange: string[]) {
  let from = new Date(dateRange[0])
  let to = new Date(dateRange[1])
  // ensure a whole day is selected
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return {
    from: from,
    to: to
  }
}

function checkAndConvertDate(text: string) {
  let date = new Date(text)
  // if num - return text as a num can be converted to date incorrectly
  if (date.toLocaleDateString("en-US") === 'Invalid Date' ||
      !isNaN(Number(text))) {
    return text
  } else {
    const dateText = format(date, 'dd/MM/yyyy')
    const dateContents = format(date, 'dd/MM/yyyy HH:mm')
    return <CellTooltip
      text={ dateText }
      contents={ dateContents }
    />
  }
}

export function checkAndAutoConvertText(text: any) {
  try {
    new URL(text) // fails if not link
    // eslint-disable-next-line
    const linkRegEx = /^https?:\/\/([^\/]*).*/
    const imgRegEx = /.*\.(?:png|jpg|jpeg)/i
    if (imgRegEx.test(text.toLowerCase())) {
      return <a href={ text } target="_blank" rel="noopener noreferrer">
        <img src={ text } alt={ text } width="30%"/>
      </a>
    }
    const uiUrl = text.replace(linkRegEx, '$1');
    return <a href={text} target="_blank" rel="noopener noreferrer">
      {uiUrl}
    </a>
  } catch {
    return checkAndConvertDate(text)
  }
}

function createLink(text: any, url: string) {
  return <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
}

export function createCellRenderer(cellRenderer: CellRenderer, data: object) {
  const propPointers: object = {}
  for (const [prop, requiredColumn] of Object.entries(cellRenderer.propPointers)) {
    if (requiredColumn.includes('.')) {
      const splitKey = requiredColumn.split('.')
      const relationship = splitKey[splitKey.length-2]
      const attribute = splitKey[splitKey.length-1]
      propPointers[prop] = data[relationship][attribute]
    } else {
      propPointers[prop] = data[requiredColumn]
    }
  }
  return <cellRenderer.element {...propPointers}/>
}

function formatAttributeData(data: object, fieldMeta: object) {
  const updatedData: object = {}
  for (let [key, value] of Object.entries(data)) {

    // temp deal with relationship objects
    if(typeof value === "object" && value !== null) {
      value = value['id']
    }

    if (fieldMeta[key] !== undefined) {
      const linkField = fieldMeta[key].link
      const cellRendererField = fieldMeta[key].cellRenderer

      // if there is a cellRenderer defined
      if (cellRendererField !== null) {
        updatedData[key] = createCellRenderer(cellRendererField, data)
        continue
      }

      // if there is a link defined and not a cellRenderer
      if (linkField !== null) {
        updatedData[key] = createLink(value, data[linkField])
        continue
      }
    }
    updatedData[key] = checkAndAutoConvertText(value)
  }
  return updatedData
}

function splitRelationshipKeys(fieldMeta: object) {
  const relationshipKeys = {};
  for (let key of Object.keys(fieldMeta)) {
    if (fieldMeta[key]['isAttribute'] === false) {
      const splitKey: string[] = key.split('.')
      relationshipKeys[key] = splitKey
    }
  }
  return relationshipKeys
}

function formatRelationshipData(relationships: object, attributes: object, fieldMetaData: object, baseUrl?: string) {
  const updatedData: object = {}
  const relationshipKeys: object = splitRelationshipKeys(fieldMetaData)
  for (const [key, splitKey] of Object.entries(relationshipKeys)) {
    const currentObject = splitKey[0]
    // checking relationship object is correct
    if (relationships[currentObject] === undefined) {
      throw Error('\'' + key + '\' is not a correct relationship object. ' +
                  'Please check your spelling and pluralisation.')
    }
    // ignoring one-to-many relationships
    if ('data' in relationships[currentObject]) {
      const headingId = splitKey.join('.')

      // creating the link
      const relData = relationships[currentObject].data
      const relLink = "/" + relData.type + "/" + relData.id.toString()

      updatedData[headingId] = (
        <RelationshipLink
          initialEndpoint={ relLink }
          relationships={ splitKey }
          attributes={ attributes }
          fieldMeta={ fieldMetaData[key] }
          baseUrl={ baseUrl }
        />
      )
    }
  }
  return updatedData
}

export function convertHeadingData(fieldMeta: FieldMeta) {
  const headerSortingClasses = () => ('sorting-active-colour');
  const headerStyling = (width: string) => { return { minWidth: width } }
  const updatedHeadings: object[] = []

  const dealWithHeadingOrder = (isActive: string) => {
    for (const key of fieldMeta.order[isActive]) {
      const meta = fieldMeta.data[key]
      let headerWidth = meta.width!.toString() + 'px'

      if (meta.isAttribute === true) {
        let heading = {
          dataField: key,
          text: meta.rename,
          headerSortingClasses,
          headerStyle: headerStyling(headerWidth),
          hidden: meta.hidden
        }
        if (meta.sort === true) {
          heading['sort'] = true
        }
        if (meta.filter === true) {
          heading['filter'] = customFilter({
            type: meta.filterType!
          })
          if (meta.filterType === 'RANGE') {
            heading['filterRenderer'] = (onFilter: any, column: any) =>
              <DatePicker onFilter={ onFilter } column={ column } />
          } else {
            heading['filterRenderer'] = (onFilter: any, column: any) => 
              <TextInput type={ meta.type! } onFilter={ onFilter } column={ column } />
          }
        }
        updatedHeadings.push(heading);
      
      // if heading is a relationship
      } else if (meta.isAttribute === false) {
        updatedHeadings.push({
          dataField: key,
          text: meta.rename,
          headerStyle: headerStyling(headerWidth),
          hidden: meta.hidden
        });
      }
    }
  }
  dealWithHeadingOrder('active')
  dealWithHeadingOrder('inactive')
  return updatedHeadings
}

export function convertTableData(data: any[], fieldMeta: FieldMeta, baseUrl?: string) {
  const updatedData: any[] = []
  data.forEach(row => {
    let fieldData = {'id': row.id}
    if ('attributes' in row) {
      const attributes = formatAttributeData(
        row.attributes,
        fieldMeta.data
      )
      fieldData = Object.assign(fieldData, attributes)
    }
    if ('relationships' in row) {
      const relationships = formatRelationshipData(
        row.relationships,
        Object.assign({'id': row.id}, row.attributes),
        fieldMeta.data,
        baseUrl
      )
      fieldData = Object.assign(fieldData, relationships)
    }
    updatedData.push(fieldData)
  });
  return updatedData;
}

function convertTypeToDefaultFilter(type: string) {
  switch(type) {
    case 'str':
    case 'int':
    case 'float':
      return 'CONTAINS';
    case 'datetime':
      return 'RANGE';
    default:
      return null;
  }
}

// structure fields via the prop 'fields'
export function structureFieldsUsingProp(fields: object, apiFieldMeta: object) {
  const fieldMeta = initialiseFieldMeta()
  for (let [key, meta] of Object.entries(fields)) {
    fieldMeta.order.active.push(key)
    fieldMeta.data[key] = addFieldDefaults(key, meta!)
    // if key is a relationship
    if (key.includes('.')) {
      if (isEmptyOrNull(meta.rename)) {
        throw Error('Relationship field \'' + key + '\' requires a rename')
      }
      fieldMeta.data[key]['isAttribute'] = false
    } else {
      fieldMeta.data[key]['isAttribute'] = true
      fieldMeta.data[key]['type'] = apiFieldMeta[key]
      // you can currently only override with 'exact' filtering
      if (fieldMeta.data[key]['filterType'] === 'EXACT') {
        fieldMeta.data[key]['filterType'] = 'EXACT'
      } else {
        fieldMeta.data[key]['filterType'] = convertTypeToDefaultFilter(apiFieldMeta[key])
      }
    }
  }
  return fieldMeta
}

function defineFieldMeta(
  key: string,
  isAttribute: boolean,
  hidden: boolean,
  type: string
) {
  let field = addFieldDefaults(key, {
    'isAttribute': isAttribute,
    'relationshipBox': !isAttribute,
    'hidden': hidden
  })
  // meta field type is 'data' for attributes
  if (isAttribute) {
    field['type'] = type
    field['filterType'] = convertTypeToDefaultFilter(type)
  }
  return field
}

// structure fields using the json-api spec
export function structureFieldsAuto(
  apiFields: object,
  apiMeta: object,
  fieldMeta: FieldMeta,
  isAttribute: boolean,
  fieldPropDefined: boolean,
  debug?: boolean
) {
  // id is seperate from attributes, so it needs to be added
  if (isAttribute) {
    apiFields = Object.assign({'id': null}, apiFields)
  }

  for (let [key, data] of Object.entries(apiFields)) {
    // ignoring one-to-many relationships
    if (!isAttribute && !('data' in data)) {
      if (debug) {
        console.warn('\'' + key + '\' is on the many side of the relationship' + 
                     ' - therefore it is being ignored.')
      }
      continue
    }

    // ignore if key already in fieldMeta
    if (!(key in fieldMeta.data)) {
      // adding to order depending on field prop being defined
      const isActive = fieldPropDefined ? 'inactive' : 'active'
      fieldMeta.order[isActive].push(key)
      fieldMeta.data[key] = defineFieldMeta(
        key,
        isAttribute,
        fieldPropDefined, // hidden as default, overridden by field prop
        apiMeta[key] // python data type
      )
    }
  }
  return fieldMeta
}

export function generateFilter(apiFilters: object, filters?: object) {
  if (filters !== undefined) {
    for (let [key, meta] of Object.entries(filters)) {
      if (meta['filterType'] === 'CONTAINS') {
        apiFilters = initialiseFilterDict(apiFilters, 'contains')
        apiFilters['contains'][key] = meta['filterVal']
      } else if (meta['filterType'] === 'RANGE') {
        apiFilters = initialiseFilterDict(apiFilters, 'range')
        apiFilters['range'][key] = formatDateRange(meta['filterVal'])
      } else if (meta['filterType'] === 'EXACT') {
        apiFilters = initialiseFilterDict(apiFilters, 'exact')
        apiFilters['exact'][key] = meta['filterVal']
      }
    }
  }
}

export function debug(apiData: object, fieldMeta: object, debug?: boolean) {
  if (debug) {
    try {
      let fieldPossibilities: any = {
        'attributes': ['id'],
        'relationships': []
      }
      const apiDataInstance = apiData[0]
      if ('attributes' in apiDataInstance) {
        for (let key of Object.keys(apiDataInstance.attributes)) {
          fieldPossibilities['attributes'].push(key)
        }
      }
      const relationships: object = apiDataInstance.relationships
      if ('relationships' in apiDataInstance) {
        for (let [key, value] of Object.entries(relationships)) {
          // ignoring one-to-many relationships
          if ('data' in value) {
            fieldPossibilities['relationships'].push(key)
          }
        }
      }
      console.log('Field Possibilities', fieldPossibilities)
      console.log('Api Response Data', apiData)
      console.log('Field Meta', fieldMeta)
    } catch(e) {}
  }
}

export function getTableStatusIndicator(errorMessage: string) {
  if (errorMessage === '') {
    return <NoDataAlert />
  } else {
    return <TableErrorAlert error={errorMessage}/>
  }
}

export function isColumnVisible(column: object) {
  if (!('hidden' in column) || !column['hidden']) {
    return true
  }
  return false
}

export function pruneHiddenColumns(columns: object[]) {
  const visibleColumns: object[] = []
  for (const column of columns) {
    if (isColumnVisible(column)) {
      visibleColumns.push(column)
    }
  }
  return visibleColumns
}

export function switchFilterVisibility(tableId: string) {
  const table = document.getElementById(tableId)
  if (table?.hasChildNodes) {
    const headers = table.childNodes[0].childNodes[0].childNodes

    let visible = false
    for (let index = 0; index < headers.length; index++) {
      const header = headers[index]
      if (header.childNodes.length > 1) {
        const elements = header.childNodes
        const filter = elements[elements.length-1]
        // @ts-ignore
        if (filter.className === "filter-input-hide") {
          // @ts-ignore
          filter.className = "filter-input-show"
          visible = true
        } else {
          // @ts-ignore
          filter.className = "filter-input-hide"
        }
      }
    }
    setFieldMetaAttributeInStorage(tableId, visible, "filterVisibility")
  }
}

export function setFilterVisibility(tableId: string) {
  if (getFieldMetaAttributeFromStorage(tableId, "filterVisibility")) {
    const table = document.getElementById(tableId)
    if (table?.hasChildNodes) {
      const headers = table.childNodes[0].childNodes[0].childNodes
  
      for (let index = 0; index < headers.length; index++) {
        const header = headers[index]
        if (header.childNodes.length > 1) {
          const elements = header.childNodes
          const filter = elements[elements.length-1]
          // @ts-ignore
          filter.className = "filter-input-show"
        }
      }
    }
  }
}

export function setTableHeight(tableId: string, height?: number) {
  if (height !== undefined) {
    const table = document.getElementById(tableId)
    if (table !== null) {
      height = height - 73 // removing the height of the buttons
      table.style.height = height.toString() + 'px';
    }
  }
}

export function setFieldMetaAttributeInStorage(tableId: string, value: any, attribute?: string) {
  if (attribute === undefined) {
    localStorage.setItem(`${tableId}-${fieldMetaVersion}`, JSON.stringify(value))
  } else {
    const fieldMeta = JSON.parse(localStorage.getItem(`${tableId}-${fieldMetaVersion}`)!)
    fieldMeta[attribute] = value
    localStorage.setItem(`${tableId}-${fieldMetaVersion}`, JSON.stringify(fieldMeta))
  }
}

export function getFieldMetaAttributeFromStorage(tableId: string, attribute?: string) {
  const data = localStorage.getItem(`${tableId}-${fieldMetaVersion}`)
  if (data !== null) {
    let fieldMeta = JSON.parse(data)
    if (attribute !== undefined) {
      return fieldMeta[attribute]
    }
    return fieldMeta
  }
  return null
}

export function deleteFieldMetaFromStorage(tableId: string) {
  localStorage.removeItem(`${tableId}-${fieldMetaVersion}`)
  window.location.reload()
}
