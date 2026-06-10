/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef } from "react";
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
  IUser,
  ACTIONS,
  TOL_DS,
  AttributeTitle,
  BOARD_ENTITIES,
  deleteComponentDiff,
  MESSAGE_TYPE,
  BOARD_MESSAGE_TEXT,
  updateComponentConfigAndUpsert,
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
  IDiffState,
  IConfigDifferences,
  IComponentConfig,
  IComponent,
  ITableDrawerSave,
  ITableConfigHandlerContext,
  TDiffComparison,
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
 * Compares two component configs for semantic equality.
 *
 * This comparison ignores derived/transient fields (currently `dataWithDefaults`)
 * and normalises object key order recursively so differences in insertion order
 * do not affect the result.
 *
 * @param a The first component config to compare.
 * @param b The second component config to compare.
 * @returns `true` if both configs are semantically equal after normalisation, otherwise `false`.
 */
export function configsAreEqual(
  a: TDiffComparison,
  b: TDiffComparison,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  // Strip derived/transient fields and sort keys for a stable comparison
  const normalise = (c: Partial<IComponentConfig>): string => {
    const stripDerived = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(stripDerived);
      if (obj !== null && typeof obj === "object") {
        const result: any = {};
        // Sort keys so insertion order doesn't affect equality
        Object.keys(obj)
          .filter((k) => k !== "dataWithDefaults")
          .sort()
          .forEach((k) => { result[k] = stripDerived(obj[k]); });
        return result;
      }
      return obj;
    };
    return JSON.stringify(stripDerived(c));
  };
  return normalise(a) === normalise(b);
}

export function validateAndCleanUserConfig(
  config: Partial<IComponentConfig> | null,
  baseConfig: Partial<IComponentConfig> | null,
): {
  cleanedConfig: Partial<IComponentConfig> | null;
  removedColumns: string[];
} {
  if (!config || !baseConfig) {
    return { cleanedConfig: config, removedColumns: [] };
  }

  const baseOrder = baseConfig?.fieldMeta?.order;
  const limitVisibility = !!baseOrder?.limitVisibility;
  // If limit visibility is disabled, allow full config without cleaning constraints
  if (!limitVisibility) {
    return { cleanedConfig: config, removedColumns: [] };
  }

  const allowedColumns = new Set<string>([
    ...(baseOrder?.active || []),
    ...(baseOrder?.inactive || []),
  ]);

  const nextConfig = structuredClone(config) as Partial<IComponentConfig>;
  const currentOrder = nextConfig?.fieldMeta?.order;
  if (!currentOrder) {
    return { cleanedConfig: nextConfig, removedColumns: [] };
  }

  const originalActive = currentOrder.active || [];
  const originalInactive = currentOrder.inactive || [];

  const removedColumns = Array.from(
    new Set(
      [...originalActive, ...originalInactive].filter(
        (column) => !allowedColumns.has(column),
      ),
    ),
  );

  if (removedColumns.length === 0) {
    return { cleanedConfig: nextConfig, removedColumns: [] };
  }

  currentOrder.active = originalActive.filter((column) =>
    allowedColumns.has(column),
  );
  currentOrder.inactive = originalInactive.filter((column) =>
    allowedColumns.has(column),
  );

  if (
    (nextConfig as any).defaultSortByAttribute &&
    !allowedColumns.has((nextConfig as any).defaultSortByAttribute)
  ) {
    (nextConfig as any).defaultSortByAttribute = undefined;
    (nextConfig as any).defaultSortByType = undefined;
  }

  return {
    cleanedConfig: nextConfig,
    removedColumns,
  };
}

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
 * @param componentId - The ID of the component whose config state is being resolved
 * @param isLoggedIn - Whether the user is currently authenticated
 * @param objectType - The object type used to resolve attribute titles in config differences
 * @param editMode - Optional flag indicating whether the table is in edit mode
 * @param remoteDiff - Optional diff config sourced from the database, passed in to avoid redundant queries
 * @returns The resolved diff state, including the current config, diff flag, and column differences
 */
export async function getInitialDiffState(
  componentId: string,
  isLoggedIn: boolean,
  objectType: string,
  baseConfig: Partial<IComponentConfig> | null,
  editMode?: boolean,
  remoteDiff?: Partial<IComponentConfig> | null,
): Promise<IDiffState> {
  // Check for a diff in local storage for anonymous users
  const localDiff = getTableConfigLocalStorage(
    `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}_${componentId}`,
  ) as Partial<IComponentConfig> | null;

  const switchConfigState = () => {
    if (editMode) {
      return baseConfig || null;
    }
    if (isLoggedIn) {
      return remoteDiff || null;
    }
    return localDiff || null;
  };

  const configState = switchConfigState();
  const { cleanedConfig, removedColumns } =
    !editMode && !!configState
      ? validateAndCleanUserConfig(configState, baseConfig)
      : { cleanedConfig: configState, removedColumns: [] as string[] };

  // Calculate the config differences for the reset confirmation display
  // Return a configDifferences object with the columns to add and remove,
  // represented as AttributeTitle components to show the source colour and provide on hover tooltips
  const getConfigDifferences = (): IConfigDifferences => {
    const resolvedConfig = cleanedConfig ?? baseConfig;
    const currentColumns = resolvedConfig?.fieldMeta?.order?.active || [];
    const publishedColumns = baseConfig?.fieldMeta?.order?.active || [];

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
    configDifferences: getConfigDifferences(),
    hasDiff: editMode ? false : isLoggedIn ? !!remoteDiff : !!localDiff,
    currentConfig: (cleanedConfig ??
      baseConfig) as Partial<ITableConfigSave> | null,
    isRedundantDiff:
      !editMode && !!cleanedConfig && configsAreEqual(cleanedConfig, baseConfig),
    removedColumns,
  };
}

/**
 * Resets a saved table-config diff for a component and reports whether the reset succeeded.
 *
 * For logged-in users, this deletes the remote diff entry. For anonymous users, this
 * removes the corresponding local-storage diff entry. A success or error popup message
 * is displayed based on the outcome.
 *
 * @param boardDataSource The data source used to perform remote diff deletion.
 * @param diffState The current diff state, used to determine whether a diff exists.
 * @param componentData The component containing diff metadata and component type.
 * @param isLoggedIn Whether the current user is authenticated.
 * @param userId The identifier of the authenticated user, used for remote diff deletion.
 * @returns `true` if a diff was reset successfully, otherwise `false`.
 */
export async function handleSavedDiffReset(
  boardDataSource: TsDataSource,
  diffState: IDiffState,
  componentData: IComponent,
  isLoggedIn?: boolean,
  userId?: string,
): Promise<boolean> {
  let isSuccessDiffReset = false;
  const diffId = componentData?.config_diff?.id;
  isLoggedIn && diffState.hasDiff && diffId
    ? await deleteComponentDiff(boardDataSource, diffId, userId ?? "").then(
        () => {
          isSuccessDiffReset = true;
        },
      )
    : diffState.hasDiff
      ? (clearTableConfigLocalStorage(
          `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}_${componentData.id}`,
        ),
        (isSuccessDiffReset = true))
      : null;

  if (isSuccessDiffReset) {
    PopUpMessage({
      type: MESSAGE_TYPE.SUCCESS,
      message: BOARD_MESSAGE_TEXT(
        componentData?.component_type || BOARD_ENTITIES.ENTITIES.COMPONENT,
      ).DIFF.RESET_SUCCESS,
    });
    return isSuccessDiffReset;
  }

  PopUpMessage({
    type: MESSAGE_TYPE.ERROR,
    message: BOARD_MESSAGE_TEXT(
      componentData?.component_type || BOARD_ENTITIES.ENTITIES.COMPONENT,
    ).DIFF.RESET_ERROR,
  });

  return isSuccessDiffReset;
}

/**
 * Builds the initial diff state for first render from component data.
 *
 * The returned state prefers the saved diff config when present, otherwise the
 * base component config. If the saved diff is semantically identical to the base
 * config, it is marked as redundant and `hasDiff` is set to `false`.
 *
 * @param componentData The component containing base config and optional saved diff config.
 * @returns The initial diff state used by table config handlers and UI.
 */
export function handleFirstLoadDiffState(
  componentData: IComponent,
): IDiffState {
  const diffConfig = componentData?.config_diff?.config ?? null;
  const baseConfig = componentData?.config ?? null;
  const { cleanedConfig, removedColumns } = validateAndCleanUserConfig(
    diffConfig,
    baseConfig,
  );
  const isRedundantDiff =
    !!cleanedConfig && configsAreEqual(cleanedConfig, baseConfig);
  return {
    currentConfig:
      (structuredClone(
        cleanedConfig ?? baseConfig ?? null,
      ) as Partial<ITableConfigSave>) ?? null,
    hasDiff: !!cleanedConfig && !isRedundantDiff,
    isRedundantDiff,
    removedColumns,
    configDifferences: { add: [], remove: [] },
  };
}

/**
 * Creates table-config change handlers that keep UI diff state and persisted config in sync.
 *
 * Each handler updates in-memory diff state immediately, then persists changes either
 * to the server (logged-in users) or local storage (anonymous users). If the resulting
 * config is equal to the base config, the stored diff is deleted rather than upserted.
 *
 * @param context The table-config handler context containing component identity, data source,
 * auth/edit mode flags, base config, and diff-state refs.
 * @returns An object with handlers for config save (`onConfigSave`), filter visibility
 * (`onFilterVisibilityChange`), column resize (`onResizeColumn`), and page size
 * (`onPageSizeChange`).
 */
export function createTableConfigHandlers({
  id,
  zone,
  boardDataSource,
  editMode,
  isLoggedIn,
  userId,
  baseConfig,
  componentData,
  diffStateRef,
  setDiffState,
}: ITableConfigHandlerContext) {
  const localStorageKey = `${BOARD_ENTITIES.ENTITIES.ENTITY_DIFF}_${id}`;

  // Debounce timer ref — shared across all handlers
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounce = (fn: () => void, ms = 500) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fn, ms);
  };

  const setHasDiff = (value: boolean) =>
    setDiffState((prev) => ({ ...prev, hasDiff: value }));

  // If nextConfig is identical to the base, delete the stored diff instead of upserting
  const persistOrDelete = (nextConfig: Partial<ITableConfigSave>) => {
    if (configsAreEqual(nextConfig, baseConfig)) {
      if (isLoggedIn) {
        const diffId = componentData?.config_diff?.id;
        if (diffId) {
          deleteComponentDiff(boardDataSource, diffId, userId ?? "").catch(() => {});
          componentData.config_diff = undefined;
        }
      } else {
        clearTableConfigLocalStorage(localStorageKey);
      }
      setHasDiff(false);
      return;
    }
    updateComponentConfigAndUpsert(
      id,
      nextConfig,
      zone,
      boardDataSource,
      editMode,
      setHasDiff,
      userId,
    );
  };

  const persistToLocalStorage = (keys: string | string[], values: any) => {
    setTableConfigLocalStorage(localStorageKey, keys, values);
    setHasDiff(true);
  };

  const onConfigSave = ({
    fieldMeta,
    defaultSortByAttribute,
    defaultSortByType,
  }: ITableDrawerSave) => {
    const newFieldMeta = optimiseFieldMetaForSave(fieldMeta);
    const nextConfig: Partial<ITableConfigSave> = {
      ...diffStateRef.current.currentConfig,
      defaultSortByAttribute,
      defaultSortByType,
      fieldMeta: newFieldMeta,
    };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    if (isLoggedIn) {
      persistOrDelete(nextConfig);
    } else {
      persistToLocalStorage(
        ["fieldMeta", "defaultSortByAttribute", "defaultSortByType"],
        [newFieldMeta, defaultSortByAttribute, defaultSortByType],
      );
    }
  };

  const onFilterVisibilityChange = (visible: boolean) => {
    const nextConfig: Partial<ITableConfigSave> = {
      ...diffStateRef.current.currentConfig,
      filterVisibility: visible,
    };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    debounce(() => persistOrDelete(nextConfig));
  };

  const onResizeColumn = (columnWidth: number, dataKey: string) => {
    const nextConfig: Partial<ITableConfigSave> = {
      ...diffStateRef.current.currentConfig,
      fieldMeta: diffStateRef.current.currentConfig?.fieldMeta
        ? { ...diffStateRef.current.currentConfig.fieldMeta }
        : undefined,
    };
    // Update the persisted 'data' field (not just dataWithDefaults which RemoteTable already updated)
    updateFieldMetaAttribute(
      nextConfig.fieldMeta!,
      dataKey,
      "width",
      columnWidth,
    );
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    debounce(() => persistOrDelete(nextConfig), 800);
  };

  const onPageSizeChange = (pageSize: number) => {
    const nextConfig: Partial<ITableConfigSave> = {
      ...diffStateRef.current.currentConfig,
      pageSize,
    };
    setDiffState((prev) => ({ ...prev, currentConfig: nextConfig }));
    if (isLoggedIn) {
      debounce(() => persistOrDelete(nextConfig));
    } else {
      persistToLocalStorage("pageSize", pageSize);
    }
  };

  return {
    onConfigSave,
    onFilterVisibilityChange,
    onResizeColumn,
    onPageSizeChange,
  };
}

export async function fetchActions(
  user: IUser | null,
  actionDataSource: TsDataSource,
  objectType: string,
): Promise<string[]> {
  if (!user) return [];
  const roleids = await getRoleIdsByNames(user.roles, actionDataSource);
  return actionDataSource
    .getListPage({
      objectType: ACTIONS.ROLE_ACTION,
      filter: {
        and_: {
          role_id: {
            in_list: {
              value: roleids,
            },
          },
        },
      },
      requestedFields: ["action.name", "action.object_type"],
    })
    .then(async (res: TDataObjectListOrNull) => {
      const data = await Promise.all(
        res?.map(async (item: any) => {
          const action = await item.fetchRelationships.action;
          return action;
        }) || [],
      );
      if (data.length === 0) {
        return [];
      }
      const actionNames: string[] = [];
      for (const action of data) {
        if (action.object_type == objectType) {
          actionNames.push(action.name);
        }
      }
      return actionNames;
    })
    .catch((error: any) => {
      PopUpMessage({
        type: "error",
        message: `Error Fetching Actions: ${error}`,
      });
      return [];
    });
}
