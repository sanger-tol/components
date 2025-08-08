/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import { format } from "date-fns";
import { customAlphabet } from "nanoid";
import { FieldMeta, IAllowedCardinality } from "..";


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

export function normaliseCaps(name: string, prefix?: string) {
  if (!name) return "";
  // make object ids clear (for auto load)
  if (prefix !== undefined) {
    if (name === "id" || name === "uid") {
      return normaliseCaps(prefix) + " ID";
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

export function deepCopy(o?: object | any[]) {
  if (!o) {
    if (Array.isArray(o)) return [];
    return {};
  }
  return JSON.parse(JSON.stringify(o));
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

export function getSourceData(fieldMeta: FieldMeta, attribute: string) {
  return fieldMeta?.data[attribute]["source"] || "";
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

export function getFlattenedMetaData(
  entityMeta: any,
  endpoint: string,
  attribute?: string
) {
  return attribute
    ? entityMeta?.flatAttributes?.[endpoint]?.[attribute]
    : entityMeta?.flatAttributes?.[endpoint];
}

export function getAttributeDetail(
  entityMeta: any,
  endpoint: string,
  attribute: string,
  detail: string
) {
  switch (detail) {
    case "display_name":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.display_name ||
        normaliseCaps(attribute)
      );
    case "description":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.description || ""
      );
    case "source":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.source || "";
    case "python_type":
      return (
        entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.python_type || ""
      );
    case "authoritative":
      return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.authoritative;
  }

  return entityMeta?.flatAttributes?.[endpoint]?.[attribute] || {};
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

export function truncateString(str: string, maxLength: number) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  }
  return str;
}

export function getAllAttributeData(
  attributes: string[],
  entityMeta: any,
  objectType: string
) {
  return attributes.reduce((acc, attr) => {
    const attributeData = getFlattenedMetaData(entityMeta, objectType, attr);
    return {
      ...acc,
      [attr]: attributeData,
    };
  }, {});
}

export function formatFilteredAttributes(attributes: any) {
  // This is specific for the attribute selector and MultiSelect
  return attributes.map((attribute: any) => {
    const { object_type, relationship_name } = attribute[1];
    return {
      label: attribute[0],
      value: attribute[0],
      object_type,
      relationship_name:
        normaliseCaps(relationship_name) ||
        `${normaliseCaps(object_type)} (Current Object Type)`,
    };
  });
}

export function filterAttributes(
  entityMeta: any,
  endpoint: string,
  allowedTypes: string[] | undefined,
  selectedSources: string[],
  recommendedOn: boolean,
  allowedCardinality: IAllowedCardinality | undefined,
  customAttributeSelection: string[] | undefined
) {
  const filteredAttributes = Object.entries(
    getFlattenedMetaData(entityMeta, endpoint)
  ).filter(([key, value]) => {
    const meta: any = value;
    const typeMatch = !allowedTypes || allowedTypes.includes(meta.python_type);
    const sourceMatch =
      selectedSources.length === 0 ||
      (selectedSources.includes("undefined")
        ? !meta.source || selectedSources.includes(meta.source)
        : selectedSources.includes(meta.source));
    const recommendedMatch = meta.authoritative === true;
    const cardinalityMatch =
      !allowedCardinality ||
      (meta.cardinality &&
        ((allowedCardinality.operator === ">" &&
          meta.cardinality > allowedCardinality.value) ||
          (allowedCardinality.operator === "<" &&
            meta.cardinality < allowedCardinality.value) ||
          (allowedCardinality.operator === "=" &&
            meta.cardinality === allowedCardinality.value) ||
          (allowedCardinality.operator === ">=" &&
            meta.cardinality >= allowedCardinality.value) ||
          (allowedCardinality.operator === "<=" &&
            meta.cardinality <= allowedCardinality.value)));
    return (
      (recommendedOn ? recommendedMatch : true) &&
      typeMatch &&
      sourceMatch &&
      cardinalityMatch &&
      (!customAttributeSelection || customAttributeSelection.includes(key))
    );
  });

  return formatFilteredAttributes(filteredAttributes);
}

export function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error("Failed to copy text: ", err));
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
    if (!value) {
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
