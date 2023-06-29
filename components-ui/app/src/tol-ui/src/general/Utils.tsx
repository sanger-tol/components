/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns'


export function convertToPath(name: string) {
  let path = name.toLowerCase()
  return path.replace(/\s+/g, '-');
}

export function formatDate(text: string) {
  try {
    let date = new Date(text)
    return format(date, 'dd/MM/yyyy HH:mm')
  } catch {
    return text
  }
}

export function stopPropagation(e: { stopPropagation: () => any; }) {
  e.stopPropagation();
}

export function isPropDefined(prop: any){
  return prop !== undefined
}

export function normaliseCaps(fieldName: string) {
  const words = fieldName.split('_');
  for (let count = 0; count < words.length; count++) {
    if (words[count] === 'id') {
      words[count] = 'ID'
    } else if (words[count] === 'uid') {
      words[count] = 'UID'
    } else {
      words[count] = words[count][0].toUpperCase() + words[count].substring(1); 
    }
  }
  return words.join(' ');
}
