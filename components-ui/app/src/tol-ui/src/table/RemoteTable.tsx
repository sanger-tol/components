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
} from '..';


export interface PRemoteTable extends IRemoteTargetAndZone {
  id: string;
  source?: string;

  fields?: FieldMeta;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  cellRenderers?: ICustomCellRenderers;
  height?: any;
  resizeableColumns?: boolean;
  basic?: boolean;
  forceUpdate?: boolean;

  onConfigSave?: (config: ITableDrawerSave) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onToggleFilterVisibility?: (visible: boolean) => void;
  onResizeColumn?: (columnWidth?: number, dataKey?: string) => void;

  pageSize?: number;
  filterVisibility?: boolean;
  displaySource?: boolean;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;
  noActionsFooter?: boolean;

  rowSelection?: boolean;
  utilityBarConfig?: PUtilityBar;
  advanceTab?: boolean;
  contents?: ReactNode;
  groupBy?: boolean;
  copySeparator?: string;
  fieldDropdownChoices?: TFieldDropdownChoices;

  actionDataSource?: TsDataSource;
  actions?: (string | IDropdownButtonConfig)[];
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;
}

export function RemoteTable(props: PRemoteTable) {
  const {
    id,
    objectType,
    dataSource,
    basic,
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
    utilityBarConfig,
    cellRenderers,
    contents,
    height = "100%",
    forceUpdate,
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
  const [filter, setFilter] = useState<object | undefined>({});
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

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [zone]);

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
    }
  }, [pageSize]);

  useEffectUpdate(() => {
    if (onToggleFilterVisibility) {
      onToggleFilterVisibility(filterVisibility);
    } else {
      setTableConfigLocalStorage(id, "filterVisibility", filterVisibility);
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
        requestedFields: amalgamateRequestedFields(fieldMeta),
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
          )
        );
        // fetch count
        dataSource
          .custom({
            method: API_METHODS.GET,
            resource: `${objectType}:count`,
            params: {
              filter: filter,
            },
          })
          .then((res: any) => {
            setTotalSize(res.data.meta.total);
          });
      })
      .catch((error: any) => {
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
    defaultSortByType
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
        defaultSortByType: defaultSortByType
      });
    } else {
      setTableConfigLocalStorage(id, "fieldMeta", optimiseFieldMetaForSave(fm));
      setTableConfigLocalStorage(id, "defaultSortByAttribute", defaultSortByAttribute);
      setTableConfigLocalStorage(id, "defaultSortByType", defaultSortByType);
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
      return <Placeholder loader height={height} />;
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
        utilityBarConfig={utilityBarConfig}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={convertedActions}
        actionsFooter={
          noActionsFooter ? undefined : {
            name: "View Actions",
            action: () => setActionModalOpen(true),
          }}
      />
    </div>
  );
}
