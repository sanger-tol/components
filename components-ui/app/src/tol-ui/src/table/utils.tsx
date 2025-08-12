/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import {
  CellTooltip,
  Field,
  FieldMeta,
  FieldMetaData,
  isFloat,
  normaliseCaps,
  Relationship,
  IEntityMeta,
  StatusMessage,
  colours,
  TsDataSource,
  IAttributeData,
  TDataObjectListOrNull,
  getFieldByName,
  ITableData,
  ITableRecord,
  ICellRenderer,
  IDataObject,
  TCellRenderer,
  Cell,
  deepCopy
} from "..";

interface Rgb {
  [key: string]: number;
  r: number;
  g: number;
  b: number;
}

export const tableVersion = "25-tabVer";

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
    dataWithDefaults: deepCopy(fieldMeta?.data) || {},
    order: fieldMeta?.order || {
      active: [],
    },
  } as FieldMeta;
}


function createLink(text: any, url: string) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

function createRelationshipBox(
  key: string,
  data: any,
  dataSource: TsDataSource,
  detail?: boolean,
) {
  const [relationship, attribute] = key.split(".");

  // cannot assume some keys exist
  if ("relationships" in data) {
    if (relationship in data["relationships"]) {
      const relationData = data["relationships"][relationship]["data"];
      // need to create attributes for id to be added to if it doesn't exist
      if (!("attributes" in relationData)) {
        relationData["attributes"] = {};
      }
      relationData["attributes"]["id"] = relationData["id"];
      if (attribute in relationData["attributes"]) {
        return (
          <Relationship
            attribute={attribute}
            data={relationData}
            detail={detail}
            dataSource={dataSource}
          />
        );
      }
    }
  }
  return "";
}

function createDate(value: string) {
  const date = new Date(value);
  const dateText = format(date, "dd/MM/yyyy");
  const dateContents = format(date, "dd/MM/yyyy HH:mm");
  return <CellTooltip followCursor value={dateText} contents={dateContents} />;
}

function createBoolean(value: boolean) {
  switch (value) {
    case true:
      return <StatusMessage message="True" status="success" />;
    case false:
      return <StatusMessage message="False" status="error" />;
    default:
      return "";
  }
}

function createImage(value: string) {
  return (
    <a href={value} target="_blank" rel="noopener noreferrer">
      <img src={value} alt={value} width="30%" />
    </a>
  );
}

function createFormattedList(list: any[]) {
  return (
    <div className="simple-tag-container">
      {list.map((value: any) => {
        return (
          <div className="simple-tag" key={value}>
            {value}
          </div>
        );
      })}
    </div>
  );
}

function createExpander(value: string) {
  const shortValue = (
    <div className="copy-icon">
      {value.substring(0, 32) + "..."}
      <FontAwesomeIcon
        icon={faCopy}
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(value);
        }}
      />
    </div>
  );

  return <CellTooltip value={shortValue} contents={value} />;
}

function createFloat(value: any) {
  return (
    <CellTooltip followCursor value={value.toFixed?.(2)} contents={value} />
  );
}

function createInteger(value: string | number) {
  return (
    <div className="tol-cell-renderer-integer">{value.toLocaleString()}</div>
  );
}

function addValueBasedCellRenderer(
  value: any,
  meta: Field,
) {
  if (meta.cellRenderer === undefined) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        meta.cellRenderer = { type: "list" };
      } else if (value.length > 32) {
        meta.cellRenderer = { type: "expander" };
      } else if (isFloat(value)) {
        meta.cellRenderer = { type: "float" };
      }
    }
  }
}

export function convertTableData(
  dataObjects: TDataObjectListOrNull,
  fieldMeta: FieldMeta,
  dataSource: TsDataSource,
) {
  if (!dataObjects) return [];
  const data: ITableData = [];
  // loop over each data object
  dataObjects!.forEach((obj) => {
    const row: ITableRecord = {};
    // loop over each field
    fieldMeta.order.active.forEach((key) => {
      // only add if undefined, not null - null = turn off cell renderer
      const value = getFieldByName(obj, key);
      if (fieldMeta.dataWithDefaults![key].cellRenderer === undefined) {
        addValueBasedCellRenderer(value, fieldMeta.dataWithDefaults![key]);
      }
      row[key] = (
        <Cell
          key={key}
          value={value}
          dataObject={obj}
          dataSource={dataSource}
          renderer={fieldMeta.dataWithDefaults![key].cellRenderer!}
        />
      );

    });
    data.push(row);
  });
  return data;
}

function addDefaultCellRenderer(key: string, type: string): TCellRenderer {
  // relationship ids have relationship boxes by default
  if (isRelationship(key) && key.split(".")[1] === "id") {
    return { type: "relationship" };
  }
  //console.log(key, type);
  switch (type) {
    case "datetime":
      return { type: "datetime" };
    case "boolean":
      return { type: "boolean" };
  }
}

function addRemoteFilterType(type: string, cardinality: number) {
  if (cardinality && cardinality < 20 && type === "str") return "multi";
  if (type === "double") return "float";
  return type;
}

function sortFieldsByRename(fieldMeta: FieldMeta) {
  if (!fieldMeta || !fieldMeta.order.inactive) return [];
  return fieldMeta.order.inactive.sort((a, b) => {
    const fieldA = fieldMeta.dataWithDefaults![a];
    const fieldB = fieldMeta.dataWithDefaults![b];
    if (fieldA.rename! < fieldB.rename!) return -1;
    if (fieldA.rename! > fieldB.rename!) return 1;
    return 0;
  });
}

function dealWithInactiveFields(
  key: string,
  fieldMeta: FieldMeta,
) {
  if (!fieldMeta.order.inactive) {
    fieldMeta.order.inactive = [];
  }
  if (!fieldMeta.order.active.includes(key)) {
    fieldMeta.order.inactive.push(key);
  }
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
    // TODO: pre-flight check for old fields
    dealWithInactiveFields(key, fieldMeta);
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

export function createSort(sortColumn: string, sortType: string) {
  if (sortType === "desc" && !sortColumn.startsWith("-")) {
    return "-" + sortColumn;
  }
  return sortColumn;
}

function deleteRedundantLocalStorageEntries(ids: string[]) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && ids.some((id) => key.includes(id))) {
      localStorage.removeItem(key);
      i--; // adjust the index after removing an item
    }
  }
}

export function setTableConfigLocalStorage(
  tableId: string,
  key: string,
  value: any
) {
  localStorage.setItem(
    `${key}-${tableId}-${tableVersion}`,
    JSON.stringify(value)
  );
}

export function getTableConfigLocalStorage(tableId: string, key: string) {
  deleteRedundantLocalStorageEntries([
    "-field-meta", // legacy suffix
    "-table-v", // recent suffix
  ]);

  const data = localStorage.getItem(`${key}-${tableId}-${tableVersion}`);
  if (data) return JSON.parse(data);
}

export function getFieldMetaLocalStorage(
  tableId: string,
  fields?: FieldMetaData
) {
  const data = localStorage.getItem(`fieldMeta-${tableId}-${tableVersion}`);
  if (data) return fieldMetaToCellRenderer(fields || {}, JSON.parse(data));
}

export function deleteFieldMetaLocalStorage(tableId: string) {
  localStorage.removeItem(`${tableId}-${tableVersion}`);
  window.location.reload();
}

export function fieldMetaToCellRenderer(
  fieldMetaData: FieldMetaData,
  fieldMeta: FieldMeta
) {
  for (const field in fieldMetaData) {
    if (fieldMeta.dataWithDefaults && fieldMetaData[field].cellRenderer) {
      fieldMeta.dataWithDefaults[field].cellRenderer = fieldMetaData[field].cellRenderer;
    }
  }
  return fieldMeta;
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
      flatData[fieldMeta?.dataWithDefaults?.[field].rename ?? field] = getFieldByName(obj, field);
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
