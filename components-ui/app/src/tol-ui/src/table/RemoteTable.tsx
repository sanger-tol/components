/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import { FieldMetaData, FieldMeta } from "./Field";
import { httpClient } from "../services/http/httpClient";
import {
  createSort,
  getFieldMetaLocalStorage,
  setTableConfigLocalStorage,
  convertTableData,
  tableDebug,
  structureFieldMeta,
  getTableConfigLocalStorage,
} from "./utils";
import Table, { NumRows } from "./Table";
import { Placeholder, TsDataSource } from "../index";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { IZone } from "../boards";
import {
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow,
} from "../filtering/utils";
import RowCounter from "./RowCounter";
import { IDropdownButtonConfig } from "../models";
import ActionCheckModal from "./actions/ActionCheckModal";
import { ACTION_ENDPOINTS, ApiMethods } from "../constants";
import ActionModal from "./actions/ActionModal";
import { addRemoteActions } from "./actions/utils";
import { useStateFallback } from "../hooks";
import { IUtilityBar } from "../general/UtilityBar";

interface Props {
  id: string;
  endpoint: string;
  baseUrl?: string;
  source?: string;
  attributeMetadataUrl?: string;
  relationshipsUrl?: string;

  fields?: FieldMetaData;
  fieldMeta?: FieldMeta; // for BoardTable use
  height?: any;
  basic?: boolean;
  forceUpdate?: boolean;

  zone?: object; // required for table filtering
  setZone?: any;
  onModalSave?: any;
  onPageSizeChange?: any;
  onToggleFilterVisibility?: any;

  defaultSort?: string;
  pageSize?: NumRows | number;
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

  actions?: (string | IDropdownButtonConfig)[];
  selectedRows?: string[];
  setSelectedRows?: (selectedRows: string[]) => void;

  debug?: boolean;
}

function RemoteTable(props: Props) {
  const {
    id,
    endpoint,
    baseUrl,
    source,
    fields,
    basic,
    forceUpdate,
    zone,
    setZone,
    onPageSizeChange,
    onToggleFilterVisibility,
    defaultSort,
    displaySource,
    noFilter,
    noPagination,
    noSorting,
    noConfigModal,
    noDownload,
    rowSelection,
    actions,
    utilityBarConfig,
    debug,
    contents
  } = props;
  const ds = new TsDataSource({ baseUrl });
  const height = props.height !== undefined ? props.height : "100%";

  // data and field information
  const [data, setData] = useState<any[]>([]);
  const [fieldMeta, setFieldMeta] = useState<FieldMeta | undefined>(
    props.fieldMeta
  );

  // pagination
  const getPageSize = () => {
    if (props.pageSize) return props.pageSize; // if overidden with prop, ignore saved value in storage
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
    if (props.filterVisibility !== undefined) return props.filterVisibility; // if overidden with prop, ignore saved value in storage
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
    const compoundedFilter = generateFilter(zone, id);
    // will trigger [filter] useEffect if update has occured
    filterHasUpdated(setFilter, filter, compoundedFilter);
    // resetFiltersBelow({id: id, zone: zone!}); occurs in <Filter />: onFilter()
  }, [zone]);

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

  const onModalSave = (fm: FieldMeta) => {
    setFieldMeta(fm);
    resetFiltersBelow({
      id: id,
      zone: zone as IZone,
      indexOffset: -1,
    });
    setZone({ ...zone });

    if (props.onModalSave) {
      props.onModalSave(fm);
    } else {
      setTableConfigLocalStorage(id, "fieldMeta", fm);
    }
  };

  const renderTable = () => {
    setLoading(true);
    // generating query params
    const params = {
      page: page,
      page_size: pageSize,
      filter: filter,
      requested_fields: Object.keys(fields as Object) || fieldMeta.order.active,
    };

    // deal with sorting
    if (sortColumn !== "") {
      params["sort_by"] = createSort(sortColumn, sortType);
    } else if (defaultSort !== undefined) {
      params["sort_by"] = defaultSort;
    }

    // get data and update state
    httpClient()
      .get("/" + endpoint, {
        params: params,
        baseURL: baseUrl,
      })
      .then(async (res: any) => {
        // error if endpoint doesn't return 200
        if (res.status !== 200) throw Error();
        const apiData = res.data.data;
        const apiMeta = res.data.meta;

        setTotalSize(apiMeta.total);
        setError("");

        // get attribute types and relationship links
        const entityMeta =
          basic !== true ? await ds.getEntityMeta() : undefined;

        let fm = fieldMeta;
        if (initialLoad) {
          fm = structureFieldMeta(
            endpoint,
            fieldMeta ?? getFieldMetaLocalStorage(id, fields),
            entityMeta,
            fields
          );
          if (!fieldMeta && !noConfigModal)
            setTableConfigLocalStorage(id, "fieldMeta", fm);
          setFieldMeta(fm as FieldMeta);
        }

        // debug logs if prop defined
        tableDebug(apiData, fm!, debug);

        // setting data using fieldMeta
        setData(convertTableData(apiData, fm as FieldMeta, baseUrl, entityMeta));
        setLoading(false);
        setInitialLoad(false);
      })
      .catch((error: any) => {
        setError(error.message);
        setLoading(false);
        setInitialLoad(false);
        setData([]);
        console.warn(error);
        console.warn("Please ensure the db has been restored");
        console.warn(
          "Please ensure the 'endpoint' prop is correct and pluralised"
        );
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
    await ds
      .custom(ACTION_ENDPOINTS.RUN_ACTION, ApiMethods.POST as string, {
        ids: ids,
        action_name: actionName,
        object_type: endpoint,
      })
      .finally(() => {
        setActionModalOpen(true);
        setSelectedRows([]);
        setLoading(false);
      });
  };

  const convertedActions = addRemoteActions(
    endpoint,
    setCurrentActionName,
    setIdExportModalOpen,
    setIdsWithReqNotMet,
    setLoading,
    idsWithReqNotMet,
    completeAction,
    actions,
    baseUrl ?? undefined
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
        objectType={endpoint}
        open={actionModalOpen}
        setOpen={setActionModalOpen}
      />
      <Table
        id={id}
        contents={contents ? contents : Contents()}
        data={data}
        fieldMeta={fieldMeta!}
        height={height}
        loading={loading}
        endpoint={endpoint}
        baseUrl={baseUrl}
        source={source}
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
        displaySource={displaySource}
        filterVisibility={filterVisibility}
        setFilterVisibility={setFilterVisibility}
        sortColumn={sortColumn}
        sortType={sortType}
        defaultSort={defaultSort}
        handleSortColumn={handleSortColumn}
        zone={zone as IZone}
        setZone={setZone}
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

export default RemoteTable;
