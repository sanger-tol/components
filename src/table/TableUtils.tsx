/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { textFilter } from 'react-bootstrap-table2-filter';


function normaliseCaps(title: string, requiredAttributes?: object) {
  try {
    const attribute = requiredAttributes![title]
    if (attribute !== '' && attribute !== null) {
      return attribute
    }
  } catch {}

  const words = title.split("_");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substring(1);
  }
  return words.join(" ");
}

// will need improving...
function checkAndConvertLink(url: string) {
  try {
    new URL(url) // fails if not link
    const linkRegEx = /^https?:\/\/([^\/]*).*/
    const imgRegEx = /.*\.(?:png|jpg|jpeg)/i
    if (imgRegEx.test(url.toLowerCase())) {
      return <a href={ url } target="_blank" rel="noopener noreferrer">
        <img src={ url } alt={ url } width="30%"/>
      </a>
    }
    const uiUrl = url.replace(linkRegEx, '$1');
    return <a href={url} target="_blank" rel="noopener noreferrer">
      {uiUrl}
    </a>
  } catch {
    return url
  }
}

function formatData(data: object) {
  const updatedData: object = {}
  for (let [key, value] of Object.entries(data)) {
    updatedData[key] = checkAndConvertLink(value)
  }
  return updatedData
}

function checkIfRequiredAttribute(heading: string, requiredAttributes?: object) {
  try {
    return Object.keys(requiredAttributes!).includes(heading)
  } catch {
    return true
  }
}

function reorderHeadings(headings: string[], requiredAttributes?: object) {
  if (typeof requiredAttributes === 'undefined') {
    return headings
  }
  try {
    const reorderedHeadings: string[] = []
    for (let attribute of Object.keys(requiredAttributes!)) {
      if (!headings.includes(attribute)) {
        console.warn('Warning: ' + attribute + 
                     ' does not link to any \'actual\' attributes.')
      }
      reorderedHeadings.push(attribute)
    }
    return reorderedHeadings
  } catch(error: any) {
    console.error('Warning: Headings could not be ordered. ' + error)
    return headings
  }
}

function searchFilter(heading: string) { 
  return textFilter({
    className: "filter-search-input-hide",
    placeholder: heading
  })
}

export function convertHeadingData(headings: string[], requiredAttributes?: object) {
  const headerSortingStyle = { backgroundColor: '#edffec' };
  const headerStyling = (width: string) => { return { minWidth: width } }

  const updatedHeadings: object[] = [{
    dataField: "id",
    text: "ID",
    sort: true,
    headerSortingStyle,
    headerStyle: headerStyling("100px")
  }]
  
  headings = reorderHeadings(headings, requiredAttributes)
  headings.forEach(heading => {
    if (checkIfRequiredAttribute(heading, requiredAttributes)) {
      const capsHeading = normaliseCaps(heading, requiredAttributes)

      updatedHeadings.push({
        dataField: heading,
        text: capsHeading,
        sort: true,
        headerSortingStyle,
        filter: searchFilter(capsHeading),
        headerStyle: headerStyling("200px")
      });
    }
  });
  return updatedHeadings
}

export function convertTableData(data: any[]) {
  const updatedData: any[] = []
  data.forEach(row => {
    const attributes = formatData(row.attributes)
    updatedData.push(Object.assign({}, { "id": row.id }, attributes))
  });
  return updatedData;
}

export function switchFilterVisability() {
  let filterVisability = getComputedStyle(document.documentElement).getPropertyValue('--filter-visability')
  if (filterVisability === 'flex') {
    filterVisability = 'none'
  } else {
    filterVisability = 'flex'
  }
  document.documentElement.style.setProperty('--filter-visability', filterVisability);
}
