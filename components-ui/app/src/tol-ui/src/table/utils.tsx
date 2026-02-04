/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import * as XLSX from "xlsx";
import {
  Field,
  FieldMeta,
  isFloat,
  normaliseCaps,
  colours,
  TsDataSource,
  IAttributeData,
  TDataObjectListOrNull,
  getFieldByName,
  ITableData,
  ITableRecord,
  TCellRenderer,
  Cell,
  deepCopy,
  ICustomCellRenderers,
  copyToClipboard,
  CELL_RENDERER_PROP_ATTRIBUTE,
  IFilter,
  TCellHeights,
  DEFAULT_ROW_HEIGHT,
  COLLAPSED_ROW_MAX_HEIGHT,
} from "..";

interface Rgb {
  [key: string]: number;
  r: number;
  g: number;
  b: number;
}

export function isRelationship(key: string) {
  return key.includes(".");
}

const sourceColours = {
  sts: colours[0],
  benchling: colours[1],
  mlwh: colours[2],
  grit: colours[3],
  goat: colours[4],
  informatics: colours[5],
  bold: colours[6],
  treeofsex: colours[7],
  tolid: colours[8],
  tolqc: colours[9],
  tolqclegacy: colours[10],
  portaldb: colours[11],
  pantheon: colours[12],
  calculated: colours[13],
  genome_notes: colours[14],
  lrpacbio: colours[15],
  other: "var(--tol-grey)",
};

export function initialiseFieldMeta(fieldMeta?: FieldMeta): FieldMeta {
  return {
    data: fieldMeta?.data || {},
    dataWithDefaults: deepCopy(fieldMeta?.data),
    order: fieldMeta?.order || {
      active: [],
    },
  } as FieldMeta;
}

function addValueBasedCellRenderer(
  value: any,
  meta: Field,
) {
  if (value) {
    if (Array.isArray(value) || typeof value === "object") {
      meta.cellRenderer = { type: "collection" };
    } else if (value.length > 32) {
      meta.cellRenderer = { type: "expander" };
    } else if (isFloat(value)) {
      meta.cellRenderer = { type: "float" };
    }
  }
}

export function convertTableData(
  dataObjects: TDataObjectListOrNull,
  dataSource: TsDataSource,
  fieldMeta: FieldMeta,
  setExpandedRows: (expandedRows: string[]) => void,
  customCellRenderers?: ICustomCellRenderers,
  editableCells?: boolean,
): ITableData {
  if (!dataObjects) return [];
  const data: ITableData = [];
  // loop over each data object
  dataObjects!.forEach((obj) => {
    const row: ITableRecord = { key: obj.id };
    // loop over each field
    fieldMeta.order.active.forEach((attribute) => {
      const value = getFieldByName(obj, attribute);
      if (!fieldMeta.dataWithDefaults![attribute]?.cellRenderer) {
        addValueBasedCellRenderer(value, fieldMeta.dataWithDefaults![attribute]);
      }
      row[attribute] = (
        <Cell
          attribute={attribute}
          value={value}
          dataObject={obj}
          dataSource={dataSource}
          renderer={fieldMeta.dataWithDefaults?.[attribute]?.cellRenderer}
          setExpandedRows={setExpandedRows}
          customCellRenderers={customCellRenderers}
          editable={editableCells}
        />
      );
    });
    data.push(row);
  });
  return data;
}

function addDefaultCellRenderer(key: string, type: string): TCellRenderer {
  switch (type) {
    case "datetime":
      return { type: "datetime" };
    case "bool":
      return { type: "boolean" };
  }
}

function addRemoteFilterType(type: string, cardinality: number) {
  if (cardinality && cardinality < 50 && type === "str") return "multi";
  if (type === "double") return "float";
  return type;
}

function sortFieldsByRename(fieldMeta: FieldMeta) {
  if (!fieldMeta || !fieldMeta.order.inactive) return;
  return fieldMeta.order.inactive.sort((a, b) => {
    const fieldA = fieldMeta.dataWithDefaults![a];
    const fieldB = fieldMeta.dataWithDefaults![b];
    if (fieldA.rename! < fieldB.rename!) return -1;
    if (fieldA.rename! > fieldB.rename!) return 1;
    return 0;
  });
}

export function addDefaultsFromEntityMeta(
  key: string,
  meta: IAttributeData,
  fieldMeta: FieldMeta
) {
  if (!fieldMeta.dataWithDefaults) fieldMeta.dataWithDefaults = {};
  const defaults = {
    cellRenderer: addDefaultCellRenderer(key, meta.python_type),
    filter: addRemoteFilterType(meta.python_type, meta.cardinality),
    isAttribute: isRelationship(key),
    rename: meta.display_name || normaliseCaps(key),
    sort: true,
    type: meta.python_type,
    description: meta.description,
    source: meta.source,
  };
  // customised field config overrides the defaults
  fieldMeta.dataWithDefaults[key] = {
    ...defaults,
    ...fieldMeta.dataWithDefaults[key],
  };
}

export async function addFieldMetaDefaults(
  objectType: string,
  fieldMeta: FieldMeta,
  dataSource: TsDataSource,
) {
  const attributes = fieldMeta.order.active.concat(
    fieldMeta.order.inactive || []
  );
  for (const key of attributes) {
    const descriptor = dataSource.getAttributeDescriptor({
      objectType: objectType,
      field: key,
    });
    await descriptor
      .then((meta) => {
        if (meta) {
          addDefaultsFromEntityMeta(key, meta, fieldMeta);
        }
      })
  }
  fieldMeta.order.inactive = sortFieldsByRename(fieldMeta);
  return fieldMeta;
}

export function createSort(sortColumn?: string, sortType?: string) {
  if (!sortColumn) return undefined;
  if (sortType === "desc" && !sortColumn.startsWith("-")) {
    return "-" + sortColumn;
  }
  return sortColumn;
}

export function optimiseFieldMetaForSave(fieldMeta?: FieldMeta) {
  const fm = deepCopy(fieldMeta);
  delete fm.dataWithDefaults;
  return fm;
}

function getTableConfigKey(id: string) {
  return `${id}-10-25`;
}

export function setTableConfigLocalStorage(
  tableId: string,
  key: string,
  value: any
) {
  let config = getTableConfigLocalStorage(tableId);
  if (!config) config = {};
  config[key] = value;
  localStorage.setItem(getTableConfigKey(tableId), JSON.stringify(config));
}

export function getTableConfigLocalStorage(tableId: string, key?: string) {
  const data = localStorage.getItem(getTableConfigKey(tableId));
  if (data) {
    const config = JSON.parse(data);
    if (key) {
      if (key in config) {
        return config[key];
      } else {
        return undefined;
      }
    }
    return config;
  }
}

function rgbToString(rgb: Rgb, opacity: number) {
  return (
    "rgba(" +
    rgb.r +
    ", " +
    rgb.g +
    ", " +
    rgb.b +
    ", " +
    opacity.toString() +
    ")"
  );
}

export function getSourceColour(sourceName?: string): string {
  const colour =
    sourceName && sourceColours[sourceName]
      ? sourceColours[sourceName]
      : sourceColours.other;

  if (typeof colour === "object" && colour !== null) {
    return rgbToString(colour, 1);
  }
  return colour;
}

export function mapKeysToDisplayNames(data: any, displayNames: any): object {
  const result: object = {};
  for (const key in data) {
    if (displayNames[key] && displayNames[key].display_name) {
      result[displayNames[key].display_name] = data[key];
    } else {
      result[normaliseCaps(key)] = data[key]; // Fallback to original key if no display_name exists
    }
  }

  return result;
}

export async function getActions(
  objectType: string,
  actionDataSource: TsDataSource
): Promise<string[]> {
  const actionsList: string[] = [];
  const actions = await actionDataSource.getListPage({
    objectType: objectType,
    filter: {
      and_: {
        object_type: { eq: { value: objectType } },
      },
    },
  });

  actions?.forEach((action) => {
    actionsList.push(action.name);
  });

  return actionsList;
}

export async function dataObjectToSpreadsheetData(
  dataObjects: TDataObjectListOrNull,
  requestedFields: string[],
  fieldMeta: FieldMeta
) {
  const spreadsheetData: any[] = [];
  dataObjects?.forEach((obj) => {
    const flatData = {};
    requestedFields.forEach((field) => {
      flatData[fieldMeta.dataWithDefaults?.[field].rename ?? field] =
        Array.isArray(getFieldByName(obj, field))
          ? getFieldByName(obj, field).toString()
          : getFieldByName(obj, field);
    });
    spreadsheetData.push(flatData);
  });
  return spreadsheetData;
}

export function exportDataToSpreadsheet(
  spreadsheetData: Array<Record<string, string>>,
  title: string
) {
  const heading = `${title.replace(/\s+/g, "_")}.xlsx`;
  const worksheet = XLSX.utils.json_to_sheet(spreadsheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ToLTable");
  XLSX.writeFile(workbook, heading, { compression: true });
}

export function formatTotalSize(totalSize: number) {
  if (totalSize === 1) return "1 Row";
  return totalSize.toLocaleString() + " Rows";
}

export function copyPageColumnValues(data: any, fieldHeader: string, separator?: string) {
  const copySet = new Set<string>(
    data.flatMap((element) =>
      Array.isArray(
        getFieldByName(element[fieldHeader].props.dataObject, fieldHeader)
      )
        ? getFieldByName(element[fieldHeader].props.dataObject, fieldHeader).join(',')
        : [getFieldByName(element[fieldHeader].props.dataObject, fieldHeader) + (separator || '')]
    )
  );
  const emptyStringsRemoval = Array.from(copySet).filter(Boolean);

  const copyList = emptyStringsRemoval.join("\n");
  copyToClipboard(copyList);
}

function addFieldsFromTemplateProp(requestedFields: Set<string>, value: unknown) {
  if (typeof value !== "string" || !value.includes("${")) return;

  const matches: string[] = value.match(CELL_RENDERER_PROP_ATTRIBUTE) || [];
  matches.forEach((match) => {
    const key = match.replace("${", "").replace("}", "").trim();
    if (key) requestedFields.add(key);
  });
}

function addFieldsFromFilterProp(requestedFields: Set<string>, value: unknown) {
  if (typeof value !== "object" || value === null || !("and_" in (value as IFilter))) return;

  const filter = value as IFilter;
  Object.keys(filter.and_ || {}).forEach((fieldSystemName) => {
    requestedFields.add(fieldSystemName);
  });
}


export function amalgamateRequestedFields(fieldMeta: FieldMeta): string[] {
  const requestedFields = new Set<string>(fieldMeta?.order.active || []);

  const dataWithDefaults = fieldMeta?.dataWithDefaults || {};
  Object.entries<any>(dataWithDefaults).forEach(([fieldName, meta]) => {
    if (meta?.custom === true) {
      requestedFields.delete(fieldName);
      return;
    }

    const cellRenderer = meta?.cellRenderer;
    const props = cellRenderer?.props || {};

    Object.values(props).forEach((value) => {
      addFieldsFromTemplateProp(requestedFields, value);
      addFieldsFromFilterProp(requestedFields, value);
    });
  });

  return Array.from(requestedFields);
}

/**
 * Determines whether any rows in the dataset can be expanded based on their cell heights.
 * This is used to determine if the row height expand/collapse control should be displayed in table header.
 * 
 * A row is considered expandable if its calculated height (the maximum of all cell heights
 * in that row) exceeds the collapsed row maximum height threshold.
 * 
 * @param data - An array of row objects, each containing at minimum a `key` property for identification
 * @param cellHeights - A map of row IDs to their respective cell heights, where each entry contains
 *                      height values for the cells in that row
 * @returns `true` if at least one row has a height greater than `COLLAPSED_ROW_MAX_HEIGHT`, `false` otherwise
 */
export function hasExpandableRows(
  data: any[],
  cellHeights: TCellHeights
): boolean {
  return (
    Array.isArray(data) &&
    data.some((row: any) => {
      const rowId = row.key;
      const rowHeights = cellHeights[rowId];
      if (!rowHeights) return false;
      const fullHeight = Math.max(
        DEFAULT_ROW_HEIGHT,
        ...Object.values(rowHeights)
      );
      return fullHeight > COLLAPSED_ROW_MAX_HEIGHT;
    })
  )
}

/**
 * Updates a specific attribute of a field within the FieldMeta object.
 * 
 * @param fieldMeta - The field metadata object to be updated
 * @param dataKey - The key identifying the specific field within the metadata
 * @param attribute - The attribute name to be updated
 * @param value - The new value to assign to the attribute
 * @param dataWithDefaults - Optional flag to also update the dataWithDefaults target. Defaults to false
 * 
 * @remarks
 * This function modifies the `fieldMeta` object in place by updating the specified attribute
 * for the given data key. It updates the "data" target by default, and optionally updates
 * the "dataWithDefaults" target if the corresponding flag is set to true.
 */
export function updateFieldMetaAttribute(
  fieldMeta: FieldMeta,
  dataKey: string,
  attribute: any,
  value: any,
  dataWithDefaults?: boolean
) {
  const updateTarget = (target: string) => {
    fieldMeta[target] = {
      ...fieldMeta[target],
      [dataKey]: {
        ...fieldMeta[target]![dataKey],
        [attribute]: value,
      },
    } as any;
  };

  updateTarget("data");
  if (dataWithDefaults) updateTarget("dataWithDefaults");
}
