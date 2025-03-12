/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import { customAlphabet } from "nanoid";
import { FieldMeta } from "../table/Field";

export function convertToPath(name: string) {
  const path = name.toLowerCase();
  return "/" + path.replace(/\s+/g, "-");
}

export function convertToName(path: string) {
  const name = path
    .replace(/^\//, "") // Remove leading slash
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  return name;
}

export function formatDate(text: string) {
  try {
    const date = new Date(text);
    return format(date, "dd/MM/yyyy HH:mm");
  } catch {
    return text;
  }
}

export function stopPropagation(e: { stopPropagation: () => any }) {
  e.stopPropagation();
}

export function isPropDefined(prop: any) {
  return prop !== undefined;
}

export function falseIfUndefined(prop: any) {
  if (prop) {
    return true;
  }
  return false;
}

export function isEmptyObject(x: object) {
  return Object.keys(x).length === 0;
}

export function normaliseCaps(name: string, endpoint?: string) {
  if (!name) return "";
  // make object ids clear (for auto load)
  if (endpoint !== undefined) {
    if (name === "id" || name === "uid") {
      return normaliseCaps(endpoint) + " ID";
    }
  }
  // replace relationship '.' with underscore ready to split
  name = name.replace(".", "_");
  const words = name.split("_");
  for (let count = 0; count < words.length; count++) {
    words[count] = normaliseWords(words[count]);
  }
  return words.join(" ");
}

function normaliseWords(word: string) {
  switch (word) {
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
  return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

export function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export function matomoAnalytics(siteId: number) {
  if (siteId) {
    const _paq = (window["_paq"] = window["_paq"] || []);
    // tracker methods like "setCustomDimension" should be called before "trackPageView"
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    (() => {
      const u = "https://matomo.sanger.ac.uk/";
      _paq.push(["setTrackerUrl", u + "matomo.php"]);
      _paq.push(["setSiteId", siteId]);
      const d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src = u + "matomo.js";
      s.parentNode!.insertBefore(g, s);
    })();
  }
}

export function numberWithSpaces(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function isInt(n: any) {
  return Number(n) === n && n % 1 === 0;
}

export function isFloat(n: any) {
  return Number(n) === n && n % 1 !== 0;
}

export function deepCopy(o?: object) {
  if (!o) return {};
  return JSON.parse(JSON.stringify(o));
}

export function capitaliseFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateId(prefix: string) {
  // Does not include special characters
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const nanoid = customAlphabet(alphabet, 12);

  return `${prefix}_${nanoid()}`;
}

export function getSourceData(fieldMeta: FieldMeta, attribute: string) {
  return fieldMeta?.data[attribute]["source"] || "";
}

export function getAttributeSources(
  entityMeta: any,
  endpoint: string,
  customAttributeSelection?: string[] | undefined
) {
  const sources = new Set<string>();
  if (
    entityMeta &&
    entityMeta.flatAttributes &&
    entityMeta.flatAttributes[endpoint]
  ) {
    Object.keys(entityMeta.flatAttributes[endpoint]).forEach((att) => {
      if (customAttributeSelection && !customAttributeSelection.includes(att)) {
        return;
      }
      const attributeObject = entityMeta.flatAttributes[endpoint][att];
      const source = attributeObject.source;
      if (source) {
        sources.add(source);
      }
    });
  }
  const sortedSources = Array.from(sources).sort((a, b) => a.localeCompare(b));
  sortedSources.unshift("all");
  sortedSources.push("undefined");
  return sortedSources;
}

export function getFlattenedMetaData(
  entityMeta: any,
  endpoint: string,
  attribute?: string,
) {
  return attribute
    ? entityMeta?.flatAttributes?.[endpoint]?.[attribute]
    : entityMeta?.flatAttributes?.[endpoint];
}

export function getAttributeDetail(
  entityMeta: any,
  endpoint: string,
  attribute: string,
  detail: string,
) {
  switch (detail) {
    case "display_name":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.display_name ||
        normaliseCaps(attribute)
      );
    case "description":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.description || "";
    case "source":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.source || "";
    case "python_type":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.python_type || "";
    case "authoritative":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.authoritative;
    
    
  }

  return entityMeta?.flatAttributes?.[endpoint]?.[attribute] || {};
}

export function filterBySource(
  source: string,
  selectedSources: string[],
  setSelectedSources: any,
) {
  if (source === "all") {
    setSelectedSources([]);
  } else if (source === "undefined") {
    if (selectedSources.includes("undefined")) {
      setSelectedSources(selectedSources.filter((s) => s !== "undefined"));
    } else {
      setSelectedSources([...selectedSources, "undefined"]);
    }
  } else {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  }
}

export function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  } else {
    console.warn('Clipboard API not available');
  }
}
