import { normaliseCaps } from "../general/Utils";

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
