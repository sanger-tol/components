/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import { customAlphabet } from "nanoid";
import {
  PopUpMessage,
  TPlateSize,
  ALPHABET,
  PLATE_DIMENSIONS,
  IEntityMeta,
  TDataObjectListOrNull,
  TPlateData,
  getFieldByName,
  RELATIONSHIP_SEPARATOR,
} from "..";

export function formatPath(name: string) {
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

export function isEmptyObject(x: object|unknown[]|undefined) {
  return Object.keys(x || {}).length === 0;
}

export function appendKeywordIfNeeded(field: string): string {
  return field.startsWith("calc_") ? field : `${field}.keyword`;
}

export function normaliseCaps(name: string, prefix?: string) {
  if (!name) return "";
  // make object ids clear (for auto load)
  if (prefix && name === "id") return normaliseCaps(prefix) + " ID";
  // replace relationship separator with underscore ready to split
  name = name.split(RELATIONSHIP_SEPARATOR).join("_");
  const words = name.split("_");
  for (let count = 0; count < words.length; count++) {
    words[count] = normaliseWords(words[count]);
  }
  return words.join(" ");
}

function normaliseWords(word: string) {
  switch (word) {
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

/**
 * Format a number with spaces as thousands separators while preserving decimals.
 * @param num The number to format.
 * @returns The formatted string.
 */
export function numberWithSpaces(num: number) {
  if (!Number.isFinite(num)) return "";
  const rounded = Number(num.toFixed(2));
  const [whole, fraction] = rounded.toString().split(".");
  const spacedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (!fraction) return spacedWhole;
  return `${spacedWhole}.${fraction}`;
}

export function isInt(n: any) {
  return Number(n) === n && n % 1 === 0;
}

export function isFloat(n: any) {
  return Number(n) === n && n % 1 !== 0;
}

export function deepCopy(o?: object | any[]) {
  if (!o) {
    if (Array.isArray(o)) return [];
    return {};
  }
  return JSON.parse(JSON.stringify(o));
}

export function deepEqual(left: any, right: any) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function capitaliseFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateId(prefix: string) {
  // does not include special characters
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const nanoid = customAlphabet(alphabet, 12);

  return `${prefix}_${nanoid()}`;
}

export function getAttributeSources(
  entityMeta: any,
  objectType: string,
  customAttributeSelection?: string[] | undefined
) {
  const sources = new Set<string>();
  if (
    entityMeta &&
    entityMeta.flatAttributes &&
    entityMeta.flatAttributes[objectType]
  ) {
    Object.keys(entityMeta.flatAttributes[objectType]).forEach((att) => {
      if (customAttributeSelection && !customAttributeSelection.includes(att)) {
        return;
      }
      const attributeObject = entityMeta.flatAttributes[objectType][att];
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

export function filterBySource(
  source: string,
  selectedSources: string[],
  setSelectedSources: any
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

export function truncateString(str: string, maxLength: number = 50) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  }
  return str;
}

export function encodeImageSrc(url: string): string {
  const match = url.match(/^(https?:\/\/[^/]+)(\/.*)$/);
  if (!match) return url;
  const origin = match[1];
  const path = match[2];
  return origin + path.split("/").map(s => encodeURIComponent(s)).join("/");
}

export function copyToClipboard(
  copyText: string,
  message: string = "Copied to clipboard",
): void {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyText)
      .catch((err) => console.error("Failed to copy text: ", err));
    PopUpMessage({
      type: "success",
      message: message,
    });
  } else {
    console.warn("Clipboard API not available");
  }
}

export function converterForElapsedTime(secondsElapsed: number): string {
  const minutes = Math.floor((secondsElapsed % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsElapsed % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function identifyDimension(dimension: TPlateSize) {
  const rowLabels: String[] = [];
  [...ALPHABET].map((letter, index) => {
    if (index < PLATE_DIMENSIONS[dimension]["y"]) rowLabels.push(letter);
  });
  const columnLabels = [...Array(PLATE_DIMENSIONS[dimension].x).keys()].map(
    (i) => String(i + 1)
  );
  return [rowLabels, columnLabels];
}

export function baseDataGenerator(rowLabels, columnLabels) {
  const dataFrame: any[] = [];
  rowLabels.forEach((rows) => {
    const cells: any[] = [];
    columnLabels.forEach((columns) => {
      const wellData = {};
      wellData["id"] = rows + columns;
      wellData["label"] = rows + columns;
      cells.push(wellData);
    });
    dataFrame.push(cells);
  });
  return dataFrame;
}

export function generatePlateData(
  objectType: string,
  entityMeta: IEntityMeta,
  dataObjects: TDataObjectListOrNull,
  data: TPlateData,
  wellPositionAttribute: string,
  wellHoverAttributeKeys: string[]
): TPlateData {
  dataObjects?.forEach((obj) => {
    const wellData = {};
    const wellPosition = getFieldByName(obj, wellPositionAttribute);
    const letter = wellPosition.match(/[a-zA-Z]/g);
    const digits = wellPosition.match(/[0-9]/g);
    wellHoverAttributeKeys.forEach((element) => {
      const displayName =
        entityMeta["flatAttributes"][objectType][element].display_name;
      wellData[displayName] = getFieldByName(obj, element);
    });
    data[ALPHABET.indexOf(letter)][Number(digits) - 1] = {
      id: wellPosition,
      label: wellPosition,
      className: "tol-primary-bg",
      data: wellData,
    };
  });
  return data;
}

export function generateWellFilter(
  clickedOnWellId: string | undefined,
  wellPositionAttribute: string
) {
  const localFilters = { and_: {} };
  localFilters["and_"][wellPositionAttribute] = {
    eq: { value: clickedOnWellId },
  };

  return localFilters;
}

export function updateContents(contents: object) {
  for (const [key, value] of Object.entries(contents)) {
    // remove or format some content
    switch (key) {
      case "history":
        delete contents[key];
        break;
      case "last_modified_at":
      case "created_at":
        contents[key] = formatDate(value);
        break;
    }
    // make nulls show a faded 'None'
    if (value === null || value === undefined) {
      contents[key] = <span className="tooltip-value-none">None</span>;
    }
  }
  return contents;
}

export function getSm(type: string) {
  switch (type) {
    case "sm":
      return 6;
    default:
      return 12;
  }
}

export function getLg(type: string) {
  switch (type) {
    case "sm":
      return 3;
    case "md":
      return 6;
    default:
      return 12;
  }
}

export function getHeight(type: string) {
  switch (type) {
    case "sm":
      return 150;
    case "md":
      return 450;
    case "lg":
      return 450;
    case "xl":
      return 600;
  }
}

export function sortObjectAlphabetically(
  obj: Record<string, any>
): Record<string, any> {
  return Object.keys(obj)
    .sort() // sort keys alphabetically
    .reduce((sortedObj: Record<string, any>, key: string) => {
      sortedObj[key] = obj[key]; // rebuild the object with sorted keys
      return sortedObj;
    }, {});
}


/**
  * Formats very large or very small numbers with SI prefix (e.g. 1K, 1M, 1G or 1m, 1µ, 1n).
 * @param value The number to format.
 * @returns The formatted string.
 */
export function normaliseNumber(value: number) {
  // Handles whole numbers
  if (value > 999999) {
    return normaliseLargeNumber(value);
  // Handles decimals
  } else if (value < 0.01 && value !== 0) {
    return normaliseDecimalNumber(value);
  } else {
    return numberWithSpaces(value);
  }
}

function normaliseLargeNumber(value: number, iteration: number = 0) {
  let normalisedValue = value;
  if (normalisedValue > 999999 && iteration < 5) {
    normalisedValue = Number((normalisedValue / 1000));
    return normaliseLargeNumber(Math.round(normalisedValue), iteration + 1);
  }
  return numberWithSpaces(Number(normalisedValue)) + ["", "k", "M", "G", "T", "P"][iteration];
}

function normaliseDecimalNumber(value: number, iteration: number = 0) {
  if (value < 0.01 && iteration < 5) {
    const normalisedValue = Number((value * 1000).toPrecision(12));
    return normaliseDecimalNumber(normalisedValue, iteration + 1);
  }
  return numberWithSpaces(value) + ["", "m", "µ", "n", "p", "f"][iteration];
}

/**
 * Checks whether a given string can be parsed into a valid Date.
 *
 * @param date - The string to validate as a date
 * @returns `true` if the string is a valid date, `false` otherwise
 */
export const isValidDate = (date: string) => {
  return !isNaN(Number(new Date(date)));
};

/**
 * Performs a deep equality check between two values.
 *
 * Recursively compares objects and arrays by value rather than by reference.
 * Handles `null`, primitives, arrays, and plain objects.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if the two values are deeply equal, `false` otherwise.
 */
export function deepestEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepestEqual(item, b[i]));
  }
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  if (keysA.some((key, i) => key !== keysB[i])) return false;
  return keysA.every((key) => deepestEqual(a[key], b[key]));
}
