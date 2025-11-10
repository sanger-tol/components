/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  normaliseCaps,
  IAllowedCardinality,
  IEntityMeta,
  PopUpMessage,
  IDescribedFilterOperator,
  IFilterOperatorOptions,
  TFilterOperatorType,
} from "..";

export function getFlattenedMetaData(
  entityMeta: IEntityMeta,
  endpoint: string,
  attribute?: string
) {
  return attribute
    ? entityMeta?.flatAttributes?.[endpoint]?.[attribute]
    : entityMeta?.flatAttributes?.[endpoint];
}

export function filterAttributes(
  entityMeta: IEntityMeta,
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

export function getAttributeDetail(
  entityMeta: IEntityMeta,
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

export function getAllAttributeData(
  attributes: string[],
  entityMeta: IEntityMeta,
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

export function attributeSelectorSearchBy(keyword: string, label: any, entityMeta: IEntityMeta, objectType: string) {
  const name = getAttributeDetail(
    entityMeta,
    objectType,
    label,
    "display_name"
  ).toLowerCase();
  const description = getAttributeDetail(
    entityMeta,
    objectType,
    label,
    "description"
  ).toLowerCase();
  const kw = keyword.toLowerCase();

  return name.includes(kw) || label.includes(kw) || description.includes(kw);
};


export function handleSetAttribute(
  newAttribute: string[],
  maxSelections: number,
  setAttributes: (attrs: string[]) => void,
  entityMeta: IEntityMeta,
  objectType: string,
  setAttributeMeta?: any
) {
  if (maxSelections) {
    if (maxSelections === 1 && newAttribute.length > 1) {
      setAttributes([newAttribute[newAttribute.length - 1]]);
      return;
    } else if (newAttribute.length > maxSelections) {
      PopUpMessage({
        type: "warning",
        message: `You can select a maximum number of ${maxSelections} items.`,
      });
      return;
    }
  }
  setAttributes(newAttribute);

  if (setAttributeMeta) {
    const allAttributeData = getAllAttributeData(
      newAttribute,
      entityMeta,
      objectType
    );
    setAttributeMeta(allAttributeData);
  }
};

export function renderTotalSelectedItems(
  values: string[],
  renderFunction: (value: string) => JSX.Element,
  populatedFieldType: string,
  additionalPopulatedFieldData?: any,
  numPopulatedFields?: number,
) {
  if (values.length === 1) {
    return renderFunction(values[0]);
  }
  return `${values.length} ${populatedFieldType}s selected${additionalPopulatedFieldData ||
    `; ${numPopulatedFields} ${numPopulatedFields === 1 ? "filter" : "filters"
    } populated.`
    }`;
};

/**
 * Generates user-readable text ("prose") describing an `_and` filter
 * 
 * @param param0 An object entry representing one operator in a filter
 * @returns Prose to be displayed next to the operator in the filter
 */
export function getReadOnlyAndFilterText(
  [operatorType, operatorOptions]: [TFilterOperatorType, IFilterOperatorOptions]
): string {
  // All proses start with "must" or "must not" to describe an operator
  // (depending on whether it's negated)
  let prose = "";
  if (operatorOptions.negate) {
    prose += "must not";
  } else {
    prose += "must";
  }

  // The rest of the message is shaped by the type of operator
  switch (operatorType) {
    case "exists":
      // The "exists" operator does not concern the exact value. It simply checks that one exists
      prose += " exist";
      break;
    case "contains":
      prose += ` have a value containing ${operatorOptions.value}`;
      break;
    case "eq":
      prose += ` equal to ${operatorOptions.value}`;
      break;
    case "gt":
      prose += ` be greater than ${operatorOptions.value}`;
      break;
    case "gte":
      prose += ` be greater than or equal to ${operatorOptions.value}`;
      break;
    case "lt":
      prose += ` be greater than ${operatorOptions.value}`;
      break;
    case "lte":
      prose += ` be greater than or equal to ${operatorOptions.value}`;
      break;
    case "in_list":
      prose += " is one of "

      operatorOptions.value.forEach((item, index) => {
        if (index == operatorOptions.value.length - 1) {
          prose += ` or ${item}`;
        } else {
          prose += ` ${item},`;
        }
      });

      break;
  }

  return prose;
}
