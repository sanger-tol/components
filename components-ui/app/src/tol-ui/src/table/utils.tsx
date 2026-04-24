/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  FieldMeta,
  normaliseCaps,
  colours,
  getFieldByName,
  DataPoints,
  deepCopy,
  copyToClipboard,
  CELL_RENDERER_PROP_ATTRIBUTE,
  DEFAULT_ROW_HEIGHT,
  COLLAPSED_ROW_MAX_HEIGHT,
  getRelationshipNameByField,
  CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY,
  CELL_RENDERER_SPREAD_OPERATOR,
  getRoleIdsByNames,
  PopUpMessage,
  User,
  ACTIONS,
  BOARDS,
  TOL_DS,
  AttributeTitle,
} from "..";

import type {
  TsDataSource,
  IAttributeData,
  TDataObjectListOrNull,
  ITableData,
  ITableRecord,
  TCellRenderer,
  ICustomCellRenderers,
  IFilter,
  TCellHeights,
  ITableConfigSave,
  TDataObjectOrNull,
  IDiffState,
  IConfigDifferences,
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
    const row: ITableRecord = { key: obj?.id };
    // loop over each field
    fieldMeta.order.active.forEach((field) => {
      row[field] = (
        <DataPoints
          field={field}
          dataObject={obj}
          dataSource={dataSource}
          renderer={fieldMeta.dataWithDefaults?.[field]?.cellRenderer}
          setExpandedRows={setExpandedRows}
          customCellRenderers={customCellRenderers}
          editable={editableCells}
          actsAs={fieldMeta.dataWithDefaults?.[field]?.acts_as}
        />
      );
    });
    data.push(row);
  });
  return data;
}

function addDefaultCellRenderer(type: string): TCellRenderer {
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
    cellRenderer: addDefaultCellRenderer(meta.python_type),
    filter: addRemoteFilterType(meta.python_type, meta.cardinality),
    isAttribute: isRelationship(key),
    rename: meta.display_name || normaliseCaps(key),
    sort: true,
    type: meta.python_type,
    description: meta.description,
    source: meta.source,
    acts_as: meta.acts_as,
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
    fieldMeta.order.inactive || [],
  );
  for (const key of attributes) {
    const descriptor = dataSource.getAttributeDescriptor({
      objectType: objectType,
      field: key,
    });
    await descriptor.then((meta) => {
      if (meta) {
        addDefaultsFromEntityMeta(key, meta, fieldMeta);
      }
    });
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
  key: string | string[],
  value: any | any[],
) {
  if (!tableId || !key || value === undefined || value === null) return;
  let config = getTableConfigLocalStorage(tableId);
  if (!config) config = {};
  if (Array.isArray(key)) {
    key.forEach((k: string, index: number) => {
      if (value[index] !== undefined && value[index] !== null)
        config[k] = value[index];
    });
  } else {
    config[key] = value;
  }
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

export function clearTableConfigLocalStorage(tableId: string) {
  localStorage.removeItem(getTableConfigKey(tableId));
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
  actionDataSource: TsDataSource,
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
    actionsList.push(action?.name);
  });

  return actionsList;
}

export function formatTotalSize(totalSize: number) {
  if (totalSize === 1) return "1 Row";
  return totalSize.toLocaleString() + " Rows";
}

export function copyPageColumnValues(
  data: any,
  fieldHeader: string,
  separator?: string,
) {
  const copySet = new Set<string>(
    data.flatMap((element) =>
      Array.isArray(
        getFieldByName(element[fieldHeader].props.dataObject, fieldHeader),
      )
        ? getFieldByName(
            element[fieldHeader].props.dataObject,
            fieldHeader,
          ).join(",")
        : [
            getFieldByName(element[fieldHeader].props.dataObject, fieldHeader) +
              (separator || ""),
          ],
    ),
  );
  const emptyStringsRemoval = Array.from(copySet).filter(Boolean);

  const copyList = emptyStringsRemoval.join("\n");
  copyToClipboard(copyList);
}

async function addFieldsFromStringProp(
  requestedFields: Set<string>,
  value: unknown,
  fieldName: string,
  dataSource: TsDataSource,
  objectType: string,
) {
  if (typeof value !== "string" || !value.includes("${")) return;

  const matches: string[] = value.match(CELL_RENDERER_PROP_ATTRIBUTE) || [];

  for (const match of matches) {
    const relativeAttribute = match
      .replace("${", "")
      .replace("}", "")
      .replace(CELL_RENDERER_SPREAD_OPERATOR, "")
      .replace(CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY, "")
      .trim();

    // Ensure we request the field for the original objectType and not the related objectType
    const relationship = getRelationshipNameByField(fieldName);
    const isMany = await dataSource.isManyDataPointsByName(
      objectType,
      fieldName.split(".")[0],
    );
    const field =
      relationship && !!isMany
        ? `${relationship}.${relativeAttribute}`
        : relativeAttribute;
    if (field) requestedFields.add(field);
  }
}

function addFieldsFromFilterProp(requestedFields: Set<string>, value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("and_" in (value as IFilter))
  )
    return;

  const filter = value as IFilter;
  Object.keys(filter.and_ || {}).forEach((fieldSystemName) => {
    requestedFields.add(fieldSystemName);
  });
}

export async function amalgamateRequestedFields(
  fieldMeta: FieldMeta,
  dataSource: TsDataSource,
  objectType: string,
): Promise<string[]> {
  const requestedFields = new Set<string>(fieldMeta?.order.active || []);

  const dataWithDefaults = fieldMeta?.dataWithDefaults || {};
  for (const [fieldName, meta] of Object.entries<any>(dataWithDefaults)) {
    // Check if the field is a custom field which won't be on the api
    if (meta?.custom === true) {
      requestedFields.delete(fieldName);
      continue;
    }

    const cellRenderer = meta?.cellRenderer;
    const props = cellRenderer?.props || {};

    for (const value of Object.values(props)) {
      await addFieldsFromStringProp(
        requestedFields,
        value,
        fieldName,
        dataSource,
        objectType,
      );
      addFieldsFromFilterProp(requestedFields, value);
    }
  }

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
  cellHeights: TCellHeights,
): boolean {
  return (
    Array.isArray(data) &&
    data.some((row: any) => {
      const rowId = row.key;
      const rowHeights = cellHeights[rowId];
      if (!rowHeights) return false;
      const fullHeight = Math.max(
        DEFAULT_ROW_HEIGHT,
        ...Object.values(rowHeights),
      );
      return fullHeight > COLLAPSED_ROW_MAX_HEIGHT;
    })
  );
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
  dataWithDefaults?: boolean,
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

/**
 * Resets a component's table configuration to its default state by deleting
 * the user-specific board diff record from the data source.
 *
 * @param componentId - The ID of the component whose table config should be reset
 * @param boardDataSource - The data source used to query and delete board diff records
 * @param userId - The ID of the user whose table config customisation should be removed
 */
export async function resetTableConfigToDefault(
  componentId: string,
  boardDataSource: TsDataSource,
  userId: string,
) {
  await boardDataSource
    .getList({
      objectType: BOARDS.BOARD_DIFF,
      filter: {
        and_: {
          component_id: { eq: { value: componentId } },
          user_id: { eq: { value: userId } },
        },
      },
      requestedFields: ["id"],
    })
    .then(async (res: TDataObjectListOrNull) => {
      const id: string = res?.["id"];
      if (id) {
        await boardDataSource.deleteByID({
          objectType: BOARDS.BOARD_DIFF,
          id: id,
        });
      }
    });
}

/**
 * Fetches the saved table configuration for a given component.
 *
 * @param dataSource - The data source used to query the component record
 * @param componentId - The ID of the component whose config should be retrieved
 * @returns The component's table config, or `null` if none exists
 */
export const getComponentConfig = async (
  dataSource: TsDataSource,
  componentId: string,
): Promise<ITableConfigSave | null> => {
  return await dataSource
    .getOne({
      objectType: BOARDS.COMPONENT,
      id: componentId,
      requestedFields: ["config"],
    })
    .then((res: TDataObjectOrNull) => {
      return res?.config || null;
    });
};

/**
 * Computes the initial diff state for a component's table configuration.
 *
 * Determines whether a user has a customised config (diff) relative to the published
 * component config, sourcing it from the database for logged-in users or from local
 * storage for anonymous users. Also calculates the columns added/removed relative to
 * the published config.
 *
 * The resolved `currentConfig` will be:
 * 1. The published config — if there is no diff, or the user is in edit mode with a diff.
 * 2. The diff config from local storage — if there is a diff and the user is not logged in.
 * 3. The diff config from the database — if there is a diff and the user is logged in (non-edit mode).
 *
 * @param dataSource - The data source used to query component and board diff records
 * @param componentId - The ID of the component whose config state is being resolved
 * @param userId - The ID of the current user
 * @param isLoggedIn - Whether the user is currently authenticated
 * @param objectType - The object type used to resolve attribute titles in config differences
 * @param editMode - Optional flag indicating whether the table is in edit mode
 * @returns The resolved diff state, including the current config, diff flag, and column differences
 */
export const getInitialDiffState = async (
  dataSource: TsDataSource,
  componentId: string,
  userId: string,
  isLoggedIn: boolean,
  objectType: string,
  editMode?: boolean,
): Promise<IDiffState> => {
  const component = await getComponentConfig(dataSource, componentId);
  // Check for a diff in the database if the user is logged in
  // Or if the user is not logged in, check local storage for a diff
  let { hasDiff, currentConfig } = isLoggedIn
    ? await setDiffState(dataSource, componentId, userId)
    : {
        hasDiff: !!getTableConfigLocalStorage(
          `${BOARDS.BOARD_DIFF}_${componentId}`,
        ),
        currentConfig: null,
      };

  // If in edit mode and has a diff, fetch current config
  // Or if there is no diff, fetch current config
  if ((editMode && hasDiff) || !hasDiff) {
    currentConfig = await getComponentConfig(dataSource, componentId);
  }

  // If the user is not logged in and there is a diff, get the diff from local storage
  let localConfig = null as ITableConfigSave | null;
  if (!isLoggedIn && hasDiff) {
    localConfig = getTableConfigLocalStorage(
      `${BOARDS.BOARD_DIFF}_${componentId}`,
    );
  }

  // Calculate the config differences for the reset confirmation display
  // Return a configDifferences object with the columns to add and remove,
  // represented as AttributeTitle components to show the source colour and provide on hover tooltips
  const getConfigDifferences = async (): Promise<IConfigDifferences> => {
    const currentColumns = isLoggedIn
      ? currentConfig?.fieldMeta?.order?.active || []
      : localConfig?.fieldMeta?.order?.active || [];
    const publishedColumns = component?.fieldMeta?.order?.active || [];
    return {
      remove: currentColumns
        .filter((col: string) => !publishedColumns.includes(col))
        .map((col: string) => (
          <AttributeTitle
            attributeId={col}
            dataSource={TOL_DS}
            objectType={objectType}
          />
        )),
      add: publishedColumns
        .filter((col: string) => !currentColumns.includes(col))
        .map((col: string) => (
          <AttributeTitle
            attributeId={col}
            dataSource={TOL_DS}
            objectType={objectType}
          />
        )),
    };
  };

  return {
    configDifferences: await getConfigDifferences(),
    hasDiff: hasDiff || !!localConfig,
    currentConfig: localConfig ? localConfig : (currentConfig ?? null),
  };
};

/**
 * Checks the database for a user-specific board diff for a given component.
 *
 * Queries the `BOARD_DIFF` records filtered by `componentId` and `userId`, returning
 * whether a diff exists and the associated config if so.
 *
 * @param dataSource - The data source used to query board diff records
 * @param componentId - The ID of the component to check for a diff
 * @param userId - The ID of the user whose diff should be checked
 * @returns A partial `IDiffState` with `hasDiff` and `currentConfig`, defaulting to
 *          `{ hasDiff: false, currentConfig: null }` on error
 */
export const setDiffState = async (
  dataSource: TsDataSource,
  componentId: string,
  userId: string,
): Promise<Partial<IDiffState>> => {
  // Check for a diff in the database for the logged-in user
  return await dataSource
    .getList({
      objectType: BOARDS.BOARD_DIFF,
      filter: {
        and_: {
          component_id: { eq: { value: componentId } },
          user_id: { eq: { value: userId } },
        },
      },
      requestedFields: ["id", "config"],
    })
    // If a diff exists, set hasDiff to true and return the current config from the database
    .then((diffs: TDataObjectListOrNull) => {
      return {
        hasDiff:
          diffs?.some((diff: TDataObjectOrNull) => diff?.config != null) ??
          false,
        currentConfig:
          diffs?.find((diff: TDataObjectOrNull) => diff?.config != null)
            ?.config ?? null,
      };
    })
    .catch(() => ({ hasDiff: false, currentConfig: null }));
};


export async function fetchActions(
  user: User | null,
  actionDataSource: TsDataSource,
  objectType: string,
): Promise<string[]> {
  if (!user) return [];
  const roleids = await getRoleIdsByNames(user.roles, actionDataSource);
  return actionDataSource.getListPage({
    objectType: ACTIONS.ROLE_ACTION,
    filter: {
      "and_": {
        "role_id": {
          "in_list": {
            "value": roleids
          },
        },
      }
    },
    requestedFields: ["action.name", "action.object_type"],
  }).then(async (res: TDataObjectListOrNull) => {
    const data = await Promise.all(res?.map(async (item: any) => {
      const action = await item.fetchRelationships.action;
      return action;
    }) || []);
    if (data.length === 0) {
      return [];
    }
    const actionNames: string[] = []
    for (const action of data) {
      if (action.object_type == objectType) {
        actionNames.push(action.name);
      }
    }
    return actionNames;
  }).catch((error: any) => {
    PopUpMessage({
      type: "error",
      message: `Error Fetching Actions: ${error}`,
    });
    return [];
  })
}