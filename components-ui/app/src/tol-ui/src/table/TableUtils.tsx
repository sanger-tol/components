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
import { normaliseCaps } from '../general/Utils'
import { addFieldDefaults, CellRenderer } from './Field';


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

function checkAndAutoConvertText(text: any) {
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

function formatRelationshipData(relationships: object, attributes: object, fieldMeta: object) {
  const updatedData: object = {}
  const relationshipKeys: object = splitRelationshipKeys(fieldMeta)
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
          fieldMeta={ fieldMeta[key] }
        />
      )
    }
  }
  return updatedData
}

export function convertHeadingData(fieldMeta: object) {
  const headerSortingClasses = () => ('sorting-active-colour');
  const headerStyling = (width: string) => { return { minWidth: width } }
  const updatedHeadings: object[] = []

  for (const [key, meta] of Object.entries(fieldMeta)) {
    let capsHeading = ''
    let headerWidth = meta.width.toString() + 'px'

    // rename via override or normalise a field name
    if (isEmptyOrNull(meta.rename)) {
      capsHeading = normaliseCaps(key)
    } else {
      capsHeading = meta.rename
    }

    if (meta.isAttribute === true) {
      let heading = {
        dataField: key,
        text: capsHeading,
        headerSortingClasses,
        headerStyle: headerStyling(headerWidth),
        hidden: meta.hidden
      }
      if (meta.sort === true) {
        heading['sort'] = true
      }
      if (meta.filter === true) {
        heading['filter'] = customFilter({
          type: meta.filterType
        })
        if (meta.filterType === 'RANGE') {
          heading['filterRenderer'] = (onFilter: any, column: any) =>
            <DatePicker onFilter={ onFilter } column={ column } />
        } else {
          heading['filterRenderer'] = (onFilter: any, column: any) => 
            <TextInput type={ meta.type } onFilter={ onFilter } column={ column } />
        }
      }
      updatedHeadings.push(heading);
    
    // if heading is a relationship
    } else if (meta.isAttribute === false) {
      updatedHeadings.push({
        dataField: key,
        text: capsHeading,
        headerStyle: headerStyling(headerWidth),
        hidden: meta.hidden
      });
    }
  }
  return updatedHeadings
}

export function convertTableData(data: any[], fieldMeta: object) {
  const updatedData: any[] = []
  data.forEach(row => {
    let fieldData = {'id': row.id}
    if ('attributes' in row) {
      const attributes = formatAttributeData(
        row.attributes,
        fieldMeta
      )
      fieldData = Object.assign(fieldData, attributes)
    }
    if ('relationships' in row) {
      const relationships = formatRelationshipData(
        row.relationships,
        Object.assign({'id': row.id}, row.attributes),
        fieldMeta
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
  for (let [key, meta] of Object.entries(fields)) {
    fields[key] = addFieldDefaults(meta)
    // if key is a relationship
    if (key.includes('.')) {
      if (isEmptyOrNull(meta.rename)) {
        throw Error('Relationship field \'' + key + '\' requires a rename')
      }
      fields[key]['isAttribute'] = false
    } else {
      fields[key]['isAttribute'] = true
      fields[key]['type'] = apiFieldMeta[key]
      // you can currently only override with 'exact' filtering
      if (fields[key]['filterType'] === 'EXACT') {
        fields[key]['filterType'] = 'EXACT'
      } else {
        fields[key]['filterType'] = convertTypeToDefaultFilter(apiFieldMeta[key])
      }
    }
  }
  return fields
}

function defineFieldMeta(
  isAttribute: boolean,
  hidden: boolean,
  type: string
) {
  let field = addFieldDefaults({
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
  fieldMeta: object,
  isAttribute: boolean,
  fieldPropDefined: boolean,
  debug?: boolean
) {
  const fields = {}

  // id is seperate from attributes, so it needs to be added
  if(isAttribute) {
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

    // adding hidden fields if not defined in fields prop
    const type = apiMeta[key]
    if (!fieldPropDefined) {
      fields[key] = defineFieldMeta(
        isAttribute,
        false,
        type
      )
    } else if (!(key in fieldMeta)) {
      fields[key] = defineFieldMeta(
        isAttribute,
        true,
        type
      )
    }
  }
  return fields
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

    for (let x = 0; x < headers.length; x++) {
      const header = headers[x]
      if (header.childNodes.length > 1) {
        const elements = header.childNodes
        const filter = elements[elements.length-1]
        // @ts-ignore
        if (filter.className === "filter-input-hide") {
          // @ts-ignore
          filter.className = "filter-input-show"
        } else {
          // @ts-ignore
          filter.className = "filter-input-hide"
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
