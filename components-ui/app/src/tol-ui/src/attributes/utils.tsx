/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  normaliseCaps,
  IAllowedCardinality,
  IEntityMeta,
  PopUpMessage,
  IFilterOperatorOptions,
  TFilterOperatorType,
  IFilter,
  TDescribedFilters,
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
 * Generates user-readable text ("prose") describing an `and_` filter
 * 
 * @param param0 An object entry representing one operator in a filter
 * @returns Prose to be displayed next to the operator in the filter
 */
export function getReadOnlyAndFilterText(
  [operatorType, operatorOptions]: [TFilterOperatorType, IFilterOperatorOptions]
): string {
  // Account for date edge case.
  // To avoid false positives, only format as a date if the date is in ISO format
  const valueAsDate = new Date(operatorOptions.value);
  const valueIsValidDate =
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(operatorOptions.value)
    && !isNaN(valueAsDate.getTime())
    && valueAsDate.toISOString() == operatorOptions.value;

  const formattedValue = valueIsValidDate ? valueAsDate.toLocaleDateString() : operatorOptions.value;

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
      prose += ` have a value containing ${formattedValue}`;
      break;
    case "eq":
      prose += ` equal ${formattedValue}`;
      break;
    case "gt":
      prose += ` be greater than ${formattedValue}`;
      break;
    case "gte":
      prose += ` be greater than or equal to ${formattedValue}`;
      break;
    case "lt":
      prose += ` be less than ${formattedValue}`;
      break;
    case "lte":
      prose += ` be less than or equal to ${formattedValue}`;
      break;
    case "in_list":
      // Even though this was from a multi-select,
      // it's still very possible the user only selected one option.
      // In that case, operate similarly to the "eq" operator.
      // However, I have chosen to change the message to differentiate it from said operator
      if ((formattedValue as Array<any>).length == 1) {
        prose += ` be ${formattedValue}`;
        break;
      }

      prose += " be one of"

      formattedValue.forEach((item: string, index: number) => {
        if (index == 0) {
          // First item in the list
          prose += ` ${item}`;
        } else if (index == formattedValue.length - 1) {
          // Last item in the list
          prose += ` or ${item}`;
        } else {
          // Middle items
          prose += `, ${item}`;
        }
      });

      break;
  }

  return prose;
}

export function generateFilterDescriptions(filter?: IFilter): TDescribedFilters {
  // Account for `filter` being undefined
  if (!filter) {
    return {};
  }

  let describedFilters: TDescribedFilters = {};
  
  // `and_` filters.
  // We first check to see whether they exist, to allow inner code to assume so
  if (filter.and_) {
    for (const [attribute, operators] of Object.entries(filter.and_)) {
      for (const operator of Object.entries(operators)) {
        if (!describedFilters[attribute]) describedFilters[attribute] = [];

        describedFilters[attribute].push(getReadOnlyAndFilterText(
          operator as [TFilterOperatorType, IFilterOperatorOptions]
        ));
      }
    }
  }

  return describedFilters;
}
