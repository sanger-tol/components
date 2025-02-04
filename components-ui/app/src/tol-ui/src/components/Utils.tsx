import { normaliseCaps } from "../general/Utils";

export function getSourceData(fieldMeta, attribute: string) {
  return fieldMeta?.data[attribute]["source"] || "";
}

export function getAttributeSources(entityMeta, endpoint) {
  const sources = new Set<string>();
  sources.add("all");
  if (
    entityMeta &&
    entityMeta.flatAttributes &&
    entityMeta.flatAttributes[endpoint]
  ) {
    Object.keys(entityMeta.flatAttributes[endpoint]).forEach((att) => {
      const attributeObject = entityMeta.flatAttributes[endpoint][att];
      const source = attributeObject.source;
      if (source) {
        sources.add(source);
      }
    });
    sources.add("undefined");
  }
  return Array.from(sources);
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

export function getDisplayName(entityMeta: any, endpoint, attribute: string) {
  return (
    entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.display_name ||
    normaliseCaps(attribute)
  );
}

export function filterBySource(
  source: string,
  selectedSources: string[],
  setSelectedSources: any
) {
  if (source === "all") {
    setSelectedSources([]);
  } else if (source === "undefined") {
    setSelectedSources(["undefined"]);
  } else if (selectedSources.includes(source)) {
    setSelectedSources(selectedSources.filter((s) => s !== source));
  } else {
    setSelectedSources([...selectedSources, source]);
  }
}
