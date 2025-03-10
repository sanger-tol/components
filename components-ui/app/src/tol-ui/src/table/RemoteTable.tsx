/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
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
  flowNameStringToActions,
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
import RemoteRowCounter from "./RemoteRowCounter";
import { DropdownButtonProps } from "../general/DropdownButtons";
import ActionCheckModal from "./ActionCheckModal";
import { ACTION_ENDPOINTS, ApiMethods } from "../constants";
import ActionModal from "./ActionModal";

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

  actions?: (string | DropdownButtonProps)[];
  configButtons?: JSX.Element[];

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
    configButtons,
    debug,
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

  const [showIdExportModal, setShowIdExportModal] = useState<boolean>(false);
  const [idsForExport, setIdsForExport] = useState<string[]>([]);
  const [idsWithReqNotMet, setIdsWithReqNotMet] = useState<any>({});
  const [currentActionName, setCurrentActionName] = useState<string>("");
  const [itemRequirements, setItemRequirements] = useState<any>({});

  // action modal
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  useEffect(() => {
    console.log("Item requirements: ", itemRequirements);
  }, [itemRequirements]);

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
        setData(convertTableData(apiData, fm as FieldMeta, baseUrl));
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

  if (error !== "") {
    return <Placeholder errorMessage={error} height={height} />;
  }

  if (initialLoad) {
    return <Placeholder loader height={height} />;
  }

  const checkIdsMeetCriteria = async (
    ids: string[],
    itemRequirements: any
  ): Promise<boolean> => {
    try {
      const failedRequirementsMap: Record<string, string[]> = {};
      if (Object.keys(itemRequirements).length === 0) {
        return true;
      }

      for (const [field, conditionStr] of Object.entries(itemRequirements)) {
        const condition = JSON.parse(
          (conditionStr as string).replace(/'/g, '"')
        );

        const filter = {
          and_: {
            id: { in_list: { value: ids } },
            [field]: condition,
          },
        };

        const res = await httpClient().get(`/${endpoint}`, {
          baseUrl: baseUrl,
          params: { filter: filter },
        });

        const data = res.data.data;
        const failedIds = ids.filter(
          (id) => !data.map((item: any) => item.id).includes(id)
        );

        if (failedIds.length > 0) {
          failedRequirementsMap[field] = failedIds;
        }
      }

      const allFailingIds = Array.from(
        new Set(Object.values(failedRequirementsMap).flat())
      );

      if (allFailingIds.length === 0) {
        return true;
      }

      setIdsWithReqNotMet({
        ...idsWithReqNotMet,
        _failureDetails: failedRequirementsMap,
      });

      return false;
    } catch (error) {
      console.error(
        "Error fetching data for checking action requirements",
        error
      );
      setLoading(false);
      return false;
    }
  };

  const checkActionHasExportCriteria = async (
    action_name: string
  ): Promise<object> => {
    const res = await httpClient().get(`/${ACTION_ENDPOINTS.GET_ACTIONS}`, {
      baseUrl: baseUrl,
      params: {
        filter: {
          and_: {
            name: { eq: { value: action_name } },
          },
        },
      },
    });
    const requirements =
      res.data.data[0]["attributes"]["params"]["requirements"] || {};
    return requirements;
  };

  //@ts-ignore
  const runAction = async (action_name: string, ids: string[]) => {
    setLoading(true);
    setCurrentActionName(action_name);
    const itemRequirements = await checkActionHasExportCriteria(action_name);

    if (Object.keys(itemRequirements).length === 0) {
      await completeAction(action_name, ids);
    } else {
      const allItemsMeetCriteria = await checkIdsMeetCriteria(
        ids,
        itemRequirements
      );
      if (!allItemsMeetCriteria) {
        setShowIdExportModal(true);
      }
    }
  };

  const completeAction = async (action_name: string, ids: string[]) => {
    setLoading(true);
    await ds
      .custom(`/${ACTION_ENDPOINTS.RUN_ACTION}`, ApiMethods.POST as string, {
        ids: ids,
        action_name: action_name,
        object_type: endpoint,
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const convertStringAction = (name: string): DropdownButtonProps =>
    ({
      dropdownButtonName: name,
      action: (ids: string[]) => runAction(name, ids),
    }) as DropdownButtonProps;

  const convertAction = (
    action: string | DropdownButtonProps
  ): DropdownButtonProps =>
    typeof action === "string" ? convertStringAction(action) : action;

  const convertedActions = actions?.map(convertAction);
  const hasHiddenFields = fields
    ? Object.values(fields).some((field) => field.hidden === true)
    : false;

  return (
    <div style={{ height: height }}>
      <ActionCheckModal
        showIdExportModal={showIdExportModal}
        setShowIdExportModal={setShowIdExportModal}
        setLoading={setLoading}
        setIdsForExport={setIdsForExport}
        setIdsWithReqNotMet={setIdsWithReqNotMet}
        idsForExport={idsForExport}
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
          <RemoteRowCounter
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
        customAttributeSelection={
          hasHiddenFields === true ? [...Object.keys(fields!)] : undefined
        }
        externalSetSelectedRows={setIdsForExport}
        externalSelectedRows={idsForExport}
        actions={flowNameStringToActions(
          ds,
          endpoint,
          setActionModalOpen,
          actions
        )}
        actionsFooter={{
          name: "View Actions",
          action: () => setActionModalOpen(true),
        }}
        configButtons={configButtons}
      />
    </div>
  );
}

export default RemoteTable;
