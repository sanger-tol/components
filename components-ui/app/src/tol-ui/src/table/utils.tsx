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
  IEntityMeta,
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
  INewCellRenderersToSave,
  isEmptyObject
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
  other: colours[30],
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
  customCellRenderers?: ICustomCellRenderers
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
          customCellRenderers={customCellRenderers}
        />
      );

    });
    data.push(row);
  });
  return data;
}

function addDefaultCellRenderer(key: string, type: string): TCellRenderer {
  // relationship ids have relationship boxes by default
  const splitKey = key.split(".")
  if (isRelationship(key) && splitKey[splitKey.length - 1] === "id") {
    return { type: "relationship" };
  }

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
  fieldMeta: FieldMeta,
) {
  if (!fieldMeta.dataWithDefaults) fieldMeta.dataWithDefaults = {};
  const defaults = {
    cellRenderer: addDefaultCellRenderer(key, meta.python_type),
    filter: addRemoteFilterType(meta.python_type, meta.cardinality),
    isAttribute: isRelationship(key),
    rename: meta.display_name || normaliseCaps(key),
    sort: true,
    type: meta.python_type,
    width: 200,
    description: meta.description,
    source: meta.source,
  }
  // customised field config overrides the defaults
  fieldMeta.dataWithDefaults[key] = { ...defaults, ...fieldMeta.dataWithDefaults[key] };
}

export function addFieldMetaDefaults(
  objectType: string,
  fieldMeta: FieldMeta,
  entityMeta: IEntityMeta,
) {
  for (const [key, meta] of Object.entries(
    entityMeta.flatAttributes[objectType]
  )) {
    if (fieldMeta.order.active.includes(key) || fieldMeta.order.inactive?.includes(key)) {
      addDefaultsFromEntityMeta(
        key,
        meta,
        fieldMeta,
      );
    }
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
  return `${id}-9-25`;
}

export function setTableConfigLocalStorage(
  tableId: string,
  key: string,
  value: any
) {
  let config = getTableConfigLocalStorage(tableId);
  if (!config) config = {};
  config[key] = value;
  localStorage.setItem(
    getTableConfigKey(tableId),
    JSON.stringify(config)
  );
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
  const rgb =
    sourceName && sourceColours[sourceName]
      ? sourceColours[sourceName]
      : sourceColours.other;

  return rgbToString(rgb, 1);
}

export function mapKeysToDisplayNames(
  data: any,
  displayNames: any
): object {
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
      flatData[fieldMeta.dataWithDefaults?.[field].rename ?? field] = Array.isArray(
        getFieldByName(obj, field)
      )
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

export function addNewCellRenderersToFieldMeta(cellRenderers: INewCellRenderersToSave, fieldMeta: FieldMeta) {
  for (const [attributeId, renderer] of Object.entries(cellRenderers)) {
    if (renderer) {
      fieldMeta.data![attributeId] = fieldMeta.data![attributeId] || {};
      fieldMeta.data![attributeId].cellRenderer = renderer;
      fieldMeta.dataWithDefaults![attributeId] = fieldMeta.dataWithDefaults![attributeId] || {};
      fieldMeta.dataWithDefaults![attributeId].cellRenderer = renderer;
    } else {
      delete fieldMeta.data![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.data![attributeId])) {
        delete fieldMeta.data![attributeId];
      }
      delete fieldMeta.dataWithDefaults![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.dataWithDefaults![attributeId])) {
        delete fieldMeta.dataWithDefaults![attributeId];
      }
    }
  }
}
