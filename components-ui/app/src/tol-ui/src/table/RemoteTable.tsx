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
  IUtilityBar,
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
  getFieldMetaLocalStorage,
  getTableConfigLocalStorage,
  resetFiltersBelow,
  setTableConfigLocalStorage,
  structureFieldMeta,
  useEffectUpdate,
  useStateFallback,
  TsDataSource,
  IEntityMeta,
  initialiseFields,
  TDataObjectListOrNull,
} from '..';


interface Props extends IRemoteTargetAndZone {
  id: string;
  source?: string;

  fields?: FieldMeta;
  height?: any;
  basic?: boolean;
  forceUpdate?: boolean;

  onModalSave?: any;
  onPageSizeChange?: any;
  onToggleFilterVisibility?: any;

  defaultSort?: string;
  pageSize?: number;
  displaySource?: boolean;
  filterVisibility?: boolean;

  noFilter?: boolean;
  noPagination?: boolean;
  noSorting?: boolean;
  noConfigModal?: boolean;
  noDownload?: boolean;

  rowSelection?: boolean;
  utilityBarConfig?: IUtilityBar;
  contents?: ReactNode;
  groupBy?: boolean;

  actionDataSource?: TsDataSource;
  actions?: (string | IDropdownButtonConfig)[];
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;
}

export function RemoteTable(props: Props) {
  const {
    id,
    objectType,
    dataSource,
    basic,
    forceUpdate,
    zone,
    setZone,
    onPageSizeChange,
    onToggleFilterVisibility,
    defaultSort,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    rowSelection,
    actionDataSource = new TsDataSource({
      apiPrefix: ACTION_API_PREFIX,
    }),
    actions,
    utilityBarConfig,
    contents,
    height = "100%",
  } = props;

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta>(props.fields ?? initialiseFields());
  const [entityMeta, setEntityMeta] = useState<IEntityMeta>();

  // pagination
  const getPageSize = () => {
    if (props.pageSize) return props.pageSize;
    const size = getTableConfigLocalStorage(id, "pageSize");
    return size ?? 50;
  };
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(getPageSize);
  const [totalSize, setTotalSize] = useState<number>(0);

  // filtering/sorting
  const [filter, setFilter] = useState<object | undefined>({});
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortType, setSortType] = useState<string>("asc");

  // filter visibility
  const getFilterVisibility = () => {
    if (props.filterVisibility !== undefined) return props.filterVisibility;
    const visible = getTableConfigLocalStorage(id, "filterVisibility");
    return visible ?? true;
  };
  const [filterVisibility, setFilterVisibility] =
    useState<boolean>(getFilterVisibility);

  // loading, error and warning info
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string>("");


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

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  useEffect(() => {
    if (!basic) {
      dataSource
        .getEntityMeta()
        .then((em: IEntityMeta) => {
          setEntityMeta(em);

          setFieldMeta(
            structureFieldMeta(
              objectType,
              fieldMeta,
              em,
            )
          );
        })
        .catch((error: any) => {
          setError(error.message);
        })
        .finally(() => {
          setInitialLoad(false);
          setLoading(false);
        });
    }
    // if (!fieldMeta && !noConfigModal)
    //   setTableConfigLocalStorage(id, "fieldMeta", fm);
  }, []);

  useEffectUpdate(() => {
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [initialLoad, zone]);

  useEffectUpdate(() => {
    renderTable();
  }, [page, sortColumn, sortType, filter, forceUpdate]);

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

  const onModalSave = (fm: FieldMeta, actions?: string[], sortByAttribute?: string, sortByType?: string) => {
    setFieldMeta(fm);
    resetFiltersBelow({
      id: id,
      zone: zone as IZone,
      indexOffset: -1,
    });
    setZone({ ...zone });

    if (props.onModalSave) {
      props.onModalSave(fm, actions, createSort(sortByAttribute || "", sortByType || "asc"));
    } else {
      setTableConfigLocalStorage(id, "fieldMeta", fm);
    }

    if (sortByAttribute) {
      setSortColumn(sortByAttribute);
      setSortType(sortByType || "asc");
    }
  };

  const renderTable = () => {
    setLoading(true);

    let sortBy: string | undefined;
    if (sortColumn !== "") {
      sortBy = createSort(sortColumn, sortType);
    } else if (defaultSort !== undefined) {
      sortBy = defaultSort;
    }

    // get data and update state
    dataSource
      .getListPage({
        objectType,
        page,
        pageSize,
        filter,
        sortBy,
        requestedFields: (fieldMeta?.order.active || []).join(','),
      })
      .then((dataObjects: TDataObjectListOrNull) => {
        setError("");
        setData(
          convertTableData(dataObjects, fieldMeta!, dataSource, entityMeta)
        );
        //setTotalSize(apiMeta.total);
      })
      .catch((error: any) => {
        setError(error.message);

        setData([]);
        console.warn(error);
        console.warn("Please ensure the db has been restored");
        console.warn(
          "Please ensure the 'endpoint' prop is correct and pluralised"
        );
      })
      .finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });
  };


  const Contents = () => {
    if (error !== "") {
      return <Placeholder errorMessage={error} height={height} />;
    }
    if (initialLoad) {
      return <Placeholder loader height={height} />;
    }

    return null;
  }

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
          }
        }
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
    actions,
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
        rowCounter={
          <RowCounter
            totalSize={totalSize}
            filter={filter}
            loading={loading}
            {...props}
          />
        }
        filterVisibility={filterVisibility}
        setFilterVisibility={setFilterVisibility}
        sortColumn={sortColumn}
        sortType={sortType}
        defaultSort={defaultSort}
        handleSortColumn={handleSortColumn}
        filter={filter}
        onModalSave={onModalSave}
        noFilter={noFilter}
        noPagination={noPagination}
        noSorting={noSorting}
        noConfigModal={noConfigModal}
        noDownload={noDownload}
        rowSelection={rowSelection}
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
