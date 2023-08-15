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

export function falseIfUndefined(prop: any){
  if (prop) {
    return true
  }
  return false
}

export function normaliseCaps(fieldName: string) {
  const words = fieldName.split('_');
  for (let count = 0; count < words.length; count++) {
    words[count] = normaliseWords(words[count])
  }
  return words.join(' ');
}

function normaliseWords(word: string) {
  switch(word) {
    case "id":
      return "ID"
    case "uid":
      return "UID"
    case "sts":
      return "STS"
    case "tolqc":
      return "ToLQC"
    case "tolid":
      return "ToLID"
    default:
      return word[0].toUpperCase() + word.substring(1); 
  }
}

export function getCssVarValue(variable: string) {
  return getComputedStyle(
    document.documentElement
  ).getPropertyValue(
    variable
  );
}
