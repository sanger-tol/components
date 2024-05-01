/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns';
import { httpClient } from '../services/http/httpClient';


export function convertToPath(name: string) {
  const path = name.toLowerCase();
  return path.replace(/\s+/g, '-');
}

export function formatDate(text: string) {
  try {
    const date = new Date(text);
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch {
    return text;
  }
}

export function stopPropagation(e: { stopPropagation: () => any; }) {
  e.stopPropagation();
}

export function isPropDefined(prop: any){
  return prop !== undefined;
}

export function falseIfUndefined(prop: any){
  if (prop) {
    return true;
  }
  return false;
}

export function isEmptyObject(x: object) {
  return Object.keys(x).length === 0;
}

export function normaliseCaps(name: string, endpoint?: string) {
  if (name === undefined) return "";
  // make object ids clear (for auto load)
  if (endpoint !== undefined) {
    if (name === "id" || name === "uid") {
      return normaliseCaps(endpoint) + " ID";
    }
  }
  // replace relationship '.' with underscore ready to split
  name = name.replace('.', '_');
  const words = name.split('_');
  for (let count = 0; count < words.length; count++) {
    words[count] = normaliseWords(words[count]);
  }
  return words.join(' ');
}

function normaliseWords(word: string) {
  switch(word) {
  case "uid":
  case "id":
    return "ID";
  case "sts":
    return "STS";
  case "tolqc":
    return "ToLQC";
  case "tolid":
    return "ToLID";
  case "tol":
    return "ToL";
  case "eln":
    return "ELN";
  case "dna":
    return "DNA";
  case "rna":
    return "RNA";
  case "mlwh":
    return "MLWH";
  case "api":
    return "API";
  case "gal":
    return "GAL";
  case "qc":
    return "QC";
  case "bnt":
    return "BnT";
  case "tubeid":
    return "Tube ID";
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
    const _paq = window["_paq"] = window["_paq"] || [];
    // tracker methods like "setCustomDimension" should be called before "trackPageView"
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (() => {
      const u="https://matomo.sanger.ac.uk/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', siteId]);
      const d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode!.insertBefore(g,s);
    })();
  }
}

export async function getConfig(endpoint: string, baseUrl?: string) {
  return await httpClient().get('/_config/' + endpoint, {
    baseURL: baseUrl
  }).then((res: any) => {
    return res.data;
  }).catch((error: any) => {
    throw error;
  });
}

export function numberWithSpaces(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function isInt(n: any){
  return Number(n) === n && n % 1 === 0;
}

export function isFloat(n: any) {
  return Number(n) === n && n % 1 !== 0;
}

export function deepCopy(o: object) {
  if (o === undefined) return {};
  return JSON.parse(
    JSON.stringify(o)
  );
}
