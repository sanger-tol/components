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
    case "tol":
      return "ToL"
    case "eln":
      return "ELN"
    case "dna":
      return "DNA"
    case "rna":
      return "RNA"
    case "mlwh":
      return "MLWH"
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

export function timeout(delay: number) {
  return new Promise( res => setTimeout(res, delay) );
}

export function matomoAnalytics(siteId: number){
  if (siteId) {
    var _paq = window["_paq"] = window["_paq"] || [];
    // tracker methods like "setCustomDimension" should be called before "trackPageView"
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (() => {
      var u="https://matomo.sanger.ac.uk/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', siteId]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode!.insertBefore(g,s);
    })();
  }
}
