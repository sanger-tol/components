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
  ACTION_API_PREFIX,
  Placeholder,
  RowCounter,
  Table,
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
  IEntityMeta,
  initialiseFieldMeta,
  TDataObjectListOrNull,
  ICustomCellRenderers,
  ITableDrawerSave,
  ITableConfigSave,
  optimiseFieldMetaForSave,
} from '..';


export interface PRemoteTable extends IRemoteTargetAndZone {
  id: string;
  source?: string;

  fields?: FieldMeta;
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  cellRenderers?: ICustomCellRenderers;
  height?: any;
  basic?: boolean;
  forceUpdate?: boolean;

  onConfigSave?: (config: ITableDrawerSave) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onToggleFilterVisibility?: (visible: boolean) => void;

  pageSize?: number;
  filterVisibility?: boolean;
  displaySource?: boolean;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;

  rowSelection?: boolean;
  utilityBarConfig?: PUtilityBar;
  contents?: ReactNode;
  groupBy?: boolean;

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
    noConfigModal,
    noDownload,
    actionDataSource = new TsDataSource({
      apiPrefix: ACTION_API_PREFIX,
    }),
    actions,
    utilityBarConfig,
    cellRenderers,
    contents,
    height = "100%",
    forceUpdate: propForceUpdate = false,
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
  const [sortByType, setSortByType] = useState<string | undefined>(defaultSortByType);
  const [filterVisibility, setFilterVisibility] = useState<boolean>(propFilterVisibility ?? true);

  // loading, error and warning info
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [downloadInProgress, setDownloadInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // flip boolean to force reload table
  const [forceUpdate, setForceUpdate] = useState<boolean>(propForceUpdate);

  // row selection
  const [selectedRows, setSelectedRows] = useStateFallback<string[]>(
    props.selectedRows,
    props.setSelectedRows,
    []
  );
  const [idExportModalOpen, setIdExportModalOpen] = useState<boolean>(false);
  const [idsWithReqNotMet, setIdsWithReqNotMet] = useState<any>({});
  const [currentActionName, setCurrentActionName] = useState<string>("");

  // action modal
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [zone]);

  useEffectUpdate(() => {
    renderTable();
  }, [page, sortByAttribute, sortByType, filter]);

  useEffectUpdate(() => {
    setInitialLoad(true);
    renderTable();
  }, [forceUpdate]);

  useEffectUpdate(() => {
    if (page === 1) renderTable();
    // setting page then triggers renderTable in useEffect above
    setPage(1);
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
      dataSource
        .getEntityMeta()
        .then((em: IEntityMeta) => {
          setFieldMeta(
            addFieldMetaDefaults(
              objectType,
              fieldMeta,
              em,
            )
          );
        })
        .catch((error: any) => {
          setError(error.message);
        })
    }
  }

  const renderTable = async () => {
    if (initialLoad) {
      await initialSetup();
    }
    setLoading(true);

    // fetch data
    dataSource
      .getListPage({
        objectType,
        page,
        pageSize,
        filter,
        sortBy: createSort(sortByAttribute, sortByType),
        requestedFields: (fieldMeta?.order.active || []).join(','),
      })
      .then((dataObjects: TDataObjectListOrNull) => {
        setError("");
        setData(
          convertTableData(dataObjects, fieldMeta!, cellRenderers)
        );
      })
      .catch((error: any) => {
        setError(error.message);
        setData([]);
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });

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

    if (defaultSortByAttribute) {
      setSortByAttribute(defaultSortByAttribute || fieldMeta?.order?.active?.[0]);
      setSortByType(defaultSortByType);
    }

    setFieldMeta(fm!);
    setForceUpdate(!forceUpdate);
  };

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortByAttribute(sortColumn);
    setSortByType(sortType);
  };

  const completeAction = async (actionName: string, ids: string[]) => {
    setLoading(true);
    await actionDataSource!
      .custom({
        method: API_METHODS.POST,
        resource: ACTIONS.RUN_ACTION,
        body: {
          data: {
            ids: ids,
            action_name: actionName,
            object_type: objectType,
          },
        },
      })
      .finally(() => {
        setActionModalOpen(true);
        setSelectedRows([]);
        setLoading(false);
      });
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
    if (initialLoad) {
      return <Placeholder loader height={height} />;
    }
    return null;
  };

  const RowCount = () => (
    <RowCounter
      totalSize={totalSize}
      setTotalSize={setTotalSize}
      filter={filter}
      loading={loading}
      {...props}
    />
  );

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
        height={height}
        loading={loading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalSize={totalSize}
        downloadInProgress={downloadInProgress}
        setDownloadInProgress={setDownloadInProgress}
        rowCounter={RowCount()}
        filterVisibility={filterVisibility}
        setFilterVisibility={setFilterVisibility}
        sortByAttribute={sortByAttribute}
        sortByType={sortByType}
        defaultSortByAttribute={defaultSortByAttribute}
        defaultSortByType={defaultSortByType}
        handleSortColumn={handleSortColumn}
        filter={filter}
        onConfigSave={onConfigSave}
        noDownload={noDownload || error !== ""}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={convertedActions}
        actionsFooter={{
          name: "View Actions",
          action: () => setActionModalOpen(true),
        }}
        utilityBarConfig={utilityBarConfig}
      />
    </div>
  );
}
