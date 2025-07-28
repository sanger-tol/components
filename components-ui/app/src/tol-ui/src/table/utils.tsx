/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  CellTooltip,
  CellRenderer,
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
  API_METHODS,
  IAttributeData,
  TDataObjectListOrNull,
  getFieldByName,
  IDataObject,
  ITableData,
  ITableRecord,
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

export function initialiseFields() {
  return {
    order: {
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
  entityMeta?: IEntityMeta,
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
            entityMeta={entityMeta}
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
  return <CellTooltip followCursor value={value.toFixed?.(2)} contents={value} />;
}

function createInteger(value: string | number) {
  return <div className="tol-cell-renderer-integer">{value.toLocaleString()}</div>;
}

function createCellRenderer(
  cellRenderer: CellRenderer,
  key: string,
  value: any,
  data: object,
  dataSource: TsDataSource,
  entityMeta?: IEntityMeta,
) {
  if (!cellRenderer) return value;
  if (typeof cellRenderer === "string") {
    if (value === null || value === undefined) return "";
    if (cellRenderer === "relationship") {
      return createRelationshipBox(key, data, dataSource, false, entityMeta);
    } else if (cellRenderer === "relationshipDetail") {
      return createRelationshipBox(key, data, dataSource, true, entityMeta);
    } else if (cellRenderer === "datetime") {
      return createDate(value);
    } else if (cellRenderer === "boolean") {
      return createBoolean(value);
    } else if (cellRenderer === "image") {
      return createImage(value);
    } else if (cellRenderer === "list") {
      return createFormattedList(value);
    } else if (cellRenderer === "expander") {
      return createExpander(value);
    } else if (cellRenderer === "float") {
      return createFloat(value);
    } else if (cellRenderer === "integer") {
      return createInteger(value);
    }
  }
  const props: object = {};
  if (cellRenderer.propPointers !== undefined) {
    for (const [prop, requiredField] of Object.entries(
      cellRenderer.propPointers
    )) {
      if (requiredField === "id") {
        props[prop] = data["id"];
      } else {
        props[prop] = data["attributes"][requiredField];
      }
    }
  }
  if (cellRenderer.props !== undefined) {
    Object.assign(props, cellRenderer.props);
  }
  // all row data always passed to use in a cellRenderer component via a rowData prop
  props["rowData"] = data;
  return <cellRenderer.element {...props} />;
}

function setValueBasedCellRenderer(
  value: any,
  meta: Field,
) {
  if (meta.cellRenderer === undefined) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        meta.cellRenderer = "list";
      } else if (value.length > 32) {
        meta.cellRenderer = "expander";
      } else if (isFloat(value)) {
        meta.cellRenderer = "float";
      }
    }
  }
}

function addCustomCellRendererData(
  key: string,
  row: ITableRecord,
  meta: Field,
) {
  if (meta?.custom) {
    row[key] = "CUSTOM_FIELD";
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
      row[key] = getFieldByName(obj, key);
      addCustomCellRendererData(key, row, fieldMeta.data![key]);
      setValueBasedCellRenderer(row[key], fieldMeta.data![key]);
      // cellRenderer logic (maybe new...
    });
    data.push(row);
  });

  console.log(data)
  return data;

  // for (const [key, value] of Object.entries(attributes)) {
  //   if (fieldMetaData[key] !== undefined) {
  //     setValueBasedCellRenderer(key, value, fieldMetaData);
  //     if (fieldMetaData[key].cellRenderer !== undefined) {
  //       rowOutput[key] = createCellRenderer(
  //         fieldMetaData[key].cellRenderer!,
  //         key,
  //         value,
  //         row,
  //         dataSource,
  //         entityMeta
  //       );
  //     } else if (fieldMetaData[key].link !== undefined) {
  //       rowOutput[key] = createLink(
  //         attributes[key],
  //         attributes[fieldMetaData[key].link]
  //       );
  //     } else {
  //       rowOutput[key] = value;
  //     }
  //   }
  // }
  // });
}

function addDefaultCellRenderer(key: string, type: string): CellRenderer {
  // relationship ids have relationship boxes by default
  if (isRelationship(key) && key.split(".")[1] === "id") {
    return "relationship";
  }
  switch (type) {
    case "datetime":
    case "boolean":
      return type;
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
    const fieldA = fieldMeta.data![a];
    const fieldB = fieldMeta.data![b];
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
  if (!fieldMeta.data) fieldMeta.data = {};
  const defaults = {
    cellRenderer: addDefaultCellRenderer(key, meta.type),
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
  fieldMeta.data[key] = { ...defaults, ...fieldMeta.data[key] };
}


export function structureFieldMeta(
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
    if (key && ids.some(id => key.includes(id))) {
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
    "-table-v" // recent suffix
  ])

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
  fields: FieldMetaData,
  fieldMeta: FieldMeta
) {
  for (const field in fields) {
    if (fieldMeta.data && fields[field].cellRenderer) {
      fieldMeta.data[field].cellRenderer = fields[field].cellRenderer;
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
  const rgb = sourceName && sourceColours[sourceName]
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
  actionDataSource: TsDataSource,
): Promise<string[]> {
  const actionsList: string[] = [];
  const actions = await actionDataSource
    .getListPage({
      objectType: objectType,
      filter: {
        and_: {
          object_type: { eq: { value: objectType } },
        },
      },
    })
  actions?.find((action) => {
    actionsList.push(action.name);
  })
  return actionsList
}
