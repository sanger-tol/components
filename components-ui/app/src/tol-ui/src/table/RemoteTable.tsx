/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import {
  ACTIONS,
  ActionCheckModal,
  ActionModal,
  API_METHODS,
  FieldMeta,
  IRemoteTargetAndZone,
  PUtilityBar,
  IZone,
  IDropdownButtonConfig,
  ACTION_API_DATA_PATH,
  Placeholder,
  Table,
  PopUpMessage,
  addRemoteActions,
  convertTableData,
  createSort,
  filterHasUpdated,
  generateFilter,
  getTableConfigLocalStorage,
  clearTableConfigLocalStorage,
  resetFiltersBelow,
  setTableConfigLocalStorage,
  addFieldMetaDefaults,
  useEffectUpdate,
  useStateFallback,
  TsDataSource,
  initialiseFieldMeta,
  TDataObjectListOrNull,
  ICustomCellRenderers,
  ITableDrawerSave,
  ITableConfigSave,
  optimiseFieldMetaForSave,
  env,
  amalgamateRequestedFields,
  TFieldDropdownChoices,
  updateFieldMetaAttribute,
  IHeight,
  TFilterOrUndefined,
  useBoard,
} from '..';

export interface PRemoteTable extends IRemoteTargetAndZone, IHeight {
  /**
   * Unique identifier for this table instance; used as the key for persisted configuration
   */
  id: string;
  /**
   * Optional label or description of the data source, shown where supported by `Table`
   */
  source?: string;

  /**
   * Initial field metadata for columns; overridden by any saved configuration for this table `id`
   */
  fields?: FieldMeta;
  /**
   * Default sort attribute when no saved sort configuration exists
   */
  defaultSortByAttribute?: string;
  /**
   * Default sort direction ("asc" or "desc") when no saved configuration exists
   */
  defaultSortByType?: string;
  /**
   * Custom cell renderers by field key to override default cell display
   */
  cellRenderers?: ICustomCellRenderers;
  /**
   * Whether the width of columns are allowed to be manually resized by users
   */
  resizeableColumns?: boolean;
  /**
   * Whether a 'super-user' can edit data directly on tables with a double-click
   */
  editableCells?: boolean;
  /**
   * If true, disables automatic enrichment of `fieldMeta` with remote metadata
   */
  basic?: boolean;
  /**
   * When changed, forces the table to re-fetch its data from the server
   */
  forceUpdate?: boolean;
  /**
   * Called when the user confirms the reset in the reset confirmation modal
   */
  onReset?: () => void;
  /**
   * Called with updated table configuration instead of storing it in local storage
   */
  onConfigSave?: (config: ITableDrawerSave) => void;
  /**
   * Called when page size changes; if set, page size is not persisted locally
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Called when filter bar visibility toggles; overrides local storage persistence
   */
  onToggleFilterVisibility?: (visible: boolean) => void;
  /**
   * Called when the user resizes the width of a column
   */
  onResizeColumn?: (columnWidth: number, dataKey: string) => void;

  /**
   * Initial page size if none is stored already for this table `id`
   */
  pageSize?: number;
  /**
   * Initial filter bar visibility if none is stored already
   */
  filterVisibility?: boolean;
  /**
   * If true, allows the UI to display the `source` information where supported
   */
  displaySource?: boolean;

  /**
   * If true, hides or disables the filter UI for this table
   */
  noFilter?: boolean;
  /**
   * If true, disables pagination controls and shows all available rows in one page
   */
  noPagination?: boolean;
  /**
   * If true, disables interactive column sorting
   */
  noSorting?: boolean;
  /**
   * If true, hides the column/configuration drawer
   */
  noConfigModal?: boolean;
  /**
   * If true, hides export or download controls
   */
  noDownload?: boolean;
  /**
   * If true, hides the footer button that opens the actions modal
   */
  noActionsFooter?: boolean;

  /**
   * If true, enables row selection checkboxes and selection state
   */
  rowSelection?: boolean;
  /**
   * Configuration for the utility bar rendered above the table
   */
  utilityBarConfig?: PUtilityBar;
  /**
   * Enables advanced tab on column selection drawer
   */
  advanceTab?: boolean;
  /**
   * Optional custom overlay or placeholder content shown while loading or on error
   */
  contents?: ReactNode;
  /**
   * If true, enables row grouping support where provided by the underlying `Table`
   */
  groupBy?: boolean;
  /**
   * String used to separate values when copying multiple cells or rows
   */
  copySeparator?: string;
  /**
   * Fields allowed to be selected in the choice dropdown
   */
  fieldDropdownChoices?: TFieldDropdownChoices;

  /**
   * Data source used to run remote actions, separate from the main `dataSource`
   */
  actionDataSource?: TsDataSource;
  /**
   * List of action identifiers or dropdown button configurations available for this table
   */
  actions?: (string | IDropdownButtonConfig)[];
  /**
   * Controlled list of currently selected row identifiers
   */
  selectedRows?: string[];
  /**
   * Controlled setter for selected row identifiers; if omitted, selection is internal
   */
  setSelectedRows?: (selectedRows: string[]) => void;
  /**
   * Controls visibility of the reset-to-default button. When true (or omitted), the
   * button is shown; when false, it is hidden. Pass false when there are no stored
   * differences to reset.
   */
  showConfigReset?: boolean;
  /**
   * Number of columns in the configuration that reset will restore.
   */
  resetConfigColumnCount?: number;
}

/**
 * @autodoc
 *
 * RemoteTable is a data table component that loads its rows from a remote API
 * via `TsDataSource`, with server-side pagination, sorting, filtering, and
 * configurable columns. It can also trigger remote actions on selected rows.
 *
 * Table configuration (field meta, sort, filters, page size, filter visibility)
 * is persisted to local storage keyed by `id`, unless external handlers are
 * provided to control those behaviours.
 *
 * @remarks
 * RemoteTable expects server-side pagination and filtering: it requests pages
 * via `dataSource.getListPage` and separately queries a `:count` endpoint for
 * the total row count.
 *
 * @remarks
 * When `onConfigSave`, `onPageSizeChange`, or `onToggleFilterVisibility` are not
 * provided, RemoteTable persists the corresponding settings to local storage
 * using the given `id` as the key namespace.
 */
export function RemoteTable(props: PRemoteTable) {
  const { editMode, setTableLoading } = useBoard();

  const {
    id,
    objectType,
    dataSource,
    basic,
    editableCells,
    resizeableColumns = true,
    zone,
    setZone,
    fields,
    defaultSortByAttribute = getTableConfigLocalStorage(id, "defaultSortByAttribute"),
    defaultSortByType = getTableConfigLocalStorage(id, "defaultSortByType"),
    filterVisibility: propFilterVisibility = getTableConfigLocalStorage(id, "filterVisibility"),
    onPageSizeChange,
    onToggleFilterVisibility,
    noDownload,
    noActionsFooter,
    actionDataSource = new TsDataSource({
      apiPath: env.API_PATH,
      apiDataPath: ACTION_API_DATA_PATH,
    }),
    actions,
    cellRenderers,
    contents,
    height = "100%",
    forceUpdate,
    onReset: propOnReset,
    showConfigReset,
  } = props;

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta>(
    initialiseFieldMeta(
      getTableConfigLocalStorage(id, "fieldMeta") || fields
    )
  );

  // pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(
    getTableConfigLocalStorage(id, "pageSize") || props.pageSize || 50
  );
  const [totalSize, setTotalSize] = useState<number>(0);

  // filtering/sorting
  const [filter, setFilter] = useState<TFilterOrUndefined>({});
  const [sortByAttribute, setSortByAttribute] = useState<string | undefined>(
    defaultSortByAttribute ?? fieldMeta?.order?.active?.[0]
  );
  const [sortByType, setSortByType] = useState<string | undefined>(
    defaultSortByType ?? "asc"
  );
  const [filterVisibility, setFilterVisibility] = useState<boolean>(propFilterVisibility ?? true);

  // loading, error and warning info
  const [loading, setLoading] = useState<boolean>(true);
  const [fullLoad, setFullLoad] = useState<boolean>(true);
  const [downloadInProgress, setDownloadInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // row selection
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    []
  );
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [idExportModalOpen, setIdExportModalOpen] = useState<boolean>(false);
  const [idsWithReqNotMet, setIdsWithReqNotMet] = useState<any>({});
  const [currentActionName, setCurrentActionName] = useState<string>("");

  // action modal
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  // Ignore the setting of actionParams until it is needed in editable cells
  // @ts-ignore
  const [actionParams, setActionParams] = useState<object>({});

  // When showConfigReset is not controlled by the caller, derive it from localStorage.
  const [localHasDiff, setLocalHasDiff] = useState<boolean>(
    showConfigReset === undefined ? !!getTableConfigLocalStorage(id) : false
  );
  const resolvedShowConfigReset = showConfigReset ?? localHasDiff;

  useEffect(() => {
    setTableLoading(id, editMode && (loading || fullLoad));
  }, [id, editMode, loading, fullLoad, setTableLoading]);

  useEffect(() => {
    return () => {
      setTableLoading(id, false);
    };
  }, [id, setTableLoading]);

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [zone]);

  useEffectUpdate(() => {
    setPage(1);
  }, [sortByAttribute, sortByType, filter, forceUpdate]);

  useEffectUpdate(() => {
    renderTable();
  }, [page, sortByAttribute, sortByType, filter, forceUpdate]);

  useEffectUpdate(() => {
    if (fullLoad) {
      if (page === 1) renderTable();
      setPage(1); // setting page then triggers useEffect above
    }
  }, [fullLoad]);

  useEffectUpdate(() => {
    if (page === 1) renderTable();
    setPage(1); // setting page then triggers useEffect above
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    } else {
      setTableConfigLocalStorage(id, "pageSize", pageSize);
      if (showConfigReset === undefined) setLocalHasDiff(true);
    }
  }, [pageSize]);

  useEffectUpdate(() => {
    if (onToggleFilterVisibility) {
      onToggleFilterVisibility(filterVisibility);
    } else {
      setTableConfigLocalStorage(id, "filterVisibility", filterVisibility);
      if (showConfigReset === undefined) setLocalHasDiff(true);
    }
  }, [filterVisibility]);

  const initialSetup = async () => {
    if (!basic) {
      setFieldMeta(
        await addFieldMetaDefaults(
          objectType,
          fieldMeta,
          dataSource,
        ).catch((error) => {
          console.error("Error in addFieldMetaDefaults:", error);
          return fieldMeta;
        })
      )
    }
  }

  const onReset = propOnReset ?? (async () => {
    clearTableConfigLocalStorage(id);
    if (showConfigReset === undefined) setLocalHasDiff(false);
    const resetFieldMeta = initialiseFieldMeta(fields);
    setFieldMeta(resetFieldMeta);
    setPageSize(props.pageSize ?? 50);
    setSortByAttribute(props.defaultSortByAttribute ?? fields?.order?.active?.[0]);
    setSortByType(props.defaultSortByType ?? "asc");
    setFilterVisibility(props.filterVisibility ?? true);
    setPage(1);
    // Re-enrich fieldMeta and explicitly re-render so changes are visible immediately
    // without requiring a page refresh
    const enrichedFieldMeta = !basic
      ? await addFieldMetaDefaults(objectType, resetFieldMeta, dataSource).catch(() => resetFieldMeta)
      : resetFieldMeta;
    setFieldMeta(enrichedFieldMeta);
    setFullLoad(true);
  });

  const renderTable = async () => {
    if (fullLoad) {
      await initialSetup();
    }
    setLoading(true);

    dataSource
      .getListPage({
        objectType,
        page,
        pageSize,
        filter,
        sortBy: createSort(sortByAttribute, sortByType),
        requestedFields: await amalgamateRequestedFields(fieldMeta, dataSource, objectType),
      })
      .then((dataObjects: TDataObjectListOrNull) => {
        setError("");
        setData(
          convertTableData(
            dataObjects,
            dataSource,
            fieldMeta!,
            setExpandedRows,
            cellRenderers,
            editableCells,
          )
        );
        // fetch count
        dataSource
          .custom({
            method: API_METHODS.POST,
            resource: `${objectType}:count`,
            body: {
              filter: filter,
            },
          })
          .then((res: any) => {
            setTotalSize(res.data.meta.total);
          });
      })
      .catch((error: any) => {
        // Temp fix for 500 errors, due to empty requested fields
        // TODO: Remove when the SDK handles empty requested fields better.
        const errorMsg = error.response.data.errors[0].detail;
        if (errorMsg.includes("Empty element in path")) {
          setData([]);
          return;
        };
        setError(error.message);
        setData([]);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
        setFullLoad(false);
      });
  };


  const onConfigSave = ({
    fieldMeta: fm,
    actions,
    defaultSortByAttribute,
    defaultSortByType,
    editMode,
  }: ITableConfigSave) => {
    resetFiltersBelow({
      id: id,
      zone: zone as IZone,
      indexOffset: -1,
    });
    setZone({ ...zone });

    if (props.onConfigSave) {
      props.onConfigSave({
        fieldMeta: fm,
        actions,
        defaultSortByAttribute: defaultSortByAttribute,
        defaultSortByType: defaultSortByType,
        editMode,
      });
    } else {
      setTableConfigLocalStorage(id, "fieldMeta", optimiseFieldMetaForSave(fm));
      setTableConfigLocalStorage(id, "defaultSortByAttribute", defaultSortByAttribute);
      setTableConfigLocalStorage(id, "defaultSortByType", defaultSortByType);
      if (showConfigReset === undefined) setLocalHasDiff(true);
    }

    setSortByAttribute(defaultSortByAttribute ?? fm?.order?.active?.[0]);
    setSortByType(defaultSortByType ?? "asc");

    setFieldMeta(fm!);
    setFullLoad(true);
  };

  const onSortColumn = (dataKey: string, sortType: "asc" | "desc") => {
    setSortByAttribute(dataKey);
    setSortByType(sortType);
  };

  const onResizeColumn = (columnWidth?: number, dataKey?: string) => {
    if (!columnWidth || !dataKey) return;

    updateFieldMetaAttribute(
      fieldMeta,
      dataKey,
      "width",
      columnWidth,
      true
    )

    if (props.onResizeColumn) {
      props.onResizeColumn(columnWidth, dataKey);
    } else {
      setTableConfigLocalStorage(id, "fieldMeta", optimiseFieldMetaForSave(fieldMeta));
      if (showConfigReset === undefined) setLocalHasDiff(true);
    }
    setFieldMeta({ ...fieldMeta });
  }

  const completeAction = async (actionName: string, ids: string[]) => {
    setLoading(true);
    const res = await actionDataSource!
      .custom({
        method: API_METHODS.POST,
        resource: ACTIONS.RUN_ACTION,
        body: {
          data: {
            ids: ids,
            action_name: actionName,
            object_type: objectType,
            params: actionParams
          },
        },
      })
      .finally(() => {
        setActionModalOpen(true);
        setSelectedRows([]);
        setLoading(false);
      });
    if (Object.keys(res.data).includes('success')) {
      PopUpMessage({
        type: 'info',
        message: `'${actionName}' triggered.`,
      })
    } else {
      PopUpMessage({
        type: 'error',
        message: `'${actionName}' failed to run.`,
      })
    }
  };

  const convertedActions = addRemoteActions(
    objectType,
    dataSource,
    actionDataSource,
    setCurrentActionName,
    setIdExportModalOpen,
    setIdsWithReqNotMet,
    setLoading,
    idsWithReqNotMet,
    completeAction,
    actions
  );

  const Contents = () => {
    if (error !== "") {
      return <Placeholder errorMessage={error} height={height} />;
    }
    if (fullLoad) {
      return (
        <Placeholder
          loader
          height={height}
          message={editMode ? "Entering edit mode..." : undefined}
          messagePosition="top"
        />
      );
    }
    return null;
  };

  return (
    <div style={{ height: height }}>
      <ActionCheckModal
        showIdExportModal={idExportModalOpen}
        setShowIdExportModal={setIdExportModalOpen}
        setLoading={setLoading}
        idsForExport={selectedRows}
        setIdsForExport={setSelectedRows}
        setIdsWithReqNotMet={setIdsWithReqNotMet}
        idsWithReqNotMet={idsWithReqNotMet}
        completeAction={completeAction}
        currentActionName={currentActionName}
      />
      <ActionModal
        objectType={ACTIONS.ACTION}
        actionDataSource={actionDataSource}
        open={actionModalOpen}
        setOpen={setActionModalOpen}
      />
      <Table
        {...props}
        contents={contents ? contents : Contents()}
        data={data}
        fieldMeta={fieldMeta!}
        expandedRows={expandedRows}
        resizeableColumns={resizeableColumns}
        height={height}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalSize={totalSize}
        downloadInProgress={downloadInProgress}
        setDownloadInProgress={setDownloadInProgress}
        filterVisibility={filterVisibility}
        setFilterVisibility={setFilterVisibility}
        sortByAttribute={sortByAttribute}
        sortByType={sortByType}
        defaultSortByAttribute={defaultSortByAttribute}
        defaultSortByType={defaultSortByType}
        onSortColumn={onSortColumn}
        filter={filter}
        onConfigSave={onConfigSave}
        onResizeColumn={onResizeColumn}
        noDownload={noDownload || error !== ""}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={convertedActions}
        actionsFooter={
          noActionsFooter ? undefined : {
            name: "View Actions",
            action: () => setActionModalOpen(true),
          }}
        onReset={onReset}
        showConfigReset={resolvedShowConfigReset}
      />
    </div>
  );
}
