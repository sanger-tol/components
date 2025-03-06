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
} from "./Utils";
import Table, { NumRows } from "./Table";
import { Placeholder, TsDataSource, Modal, Button } from "../index";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { IZone } from "../boards";
import {
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow,
} from "../filtering/Utils";
import RemoteRowCounter from "./RemoteRowCounter";
import { DropdownButtonProps } from "../general/DropdownButtons";

interface Props {
  id: string;
  endpoint: string;
  baseUrl?: string;
  attributeMetadataUrl?: string;
  relationshipsUrl?: string;

  fields?: FieldMetaData;
  fieldMeta?: FieldMeta; // for BoardTable use
  height?: any;
  basic?: boolean;
  forceUpdate?: boolean;

  zone: object;
  setZone: any;
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

  const [actionNotReady, setActionNotReady] = useState<boolean>(false);
  const [showIdExportModal, setShowIdExportModal] = useState<boolean>(false);
  const [idsForExport, setIdsForExport] = useState<string[]>([]);
  const [idsWithReqNotMet, setIdsWithReqNotMet] = useState<string[]>([]);

  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  useEffect(() => {
    console.log("idsWithReqNotMet", idsWithReqNotMet);
  }, [idsWithReqNotMet]);

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
          if (!fieldMeta) setTableConfigLocalStorage(id, "fieldMeta", fm);
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

  const handleModalClose = () => {
    setShowIdExportModal(false);
    setLoading(false);
  };

  const modalActionButtons = (
    <div className="tol-table-action-modal-btns">
      <Button
        type="success"
        onClick={() => setActionNotReady(false)}
        text="Complete Action"
        className="tol-table-action-modal-success-btn"
      />
      <Button type="error" onClick={() => handleModalClose()} text="Cancel" />
    </div>
  );

  const exportItem = (id: string) => {
    return (
      <div key={id} className="tol-table-action-modal-export-item-container">
        <div
          className={`tol-table-action-modal-export-item ${
            idsWithReqNotMet.includes(id) ? "error" : ""
          }`}
        >
          <p>{id}</p>
        </div>
        {idsWithReqNotMet.includes(id) && (
          <Button
            type="error"
            onClick={() => {}}
            icon={"xmark"}
            tooltip="Remove"
            className="tol-table-action-modal-export-item-remove-btn"
          />
        )}
      </div>
    );
  };

  //TODO: finish action complete, remove items from list

  const idCheckModalBody = (
    <div className="tol-table-action-modal-body-container">
      <p>
        This is because they don't meet the criteria for actioning, please check
        them and try again. You can also remove them from the list of items to
        be actioned.
      </p>
      <h6>Items to be actioned (issues highlighted):</h6>
      <div
        className="tol-table-action-modal-export-item-list-container"
      >
        {idsForExport.map((id) => exportItem(id))}
      </div>
      {modalActionButtons}
    </div>
  );

  const checkIdsMeetCriteria = async (ids: string[]) => {
    const res = await httpClient().get(`/${endpoint}`, {
      baseUrl: baseUrl,
      params: {
        filter: {
          and_: {
            id: { in_list: { value: ids } },
            "specimen.id": { eq: { value: "1" } }, //TODO: change to correct query
          },
        },
      },
    });
    const data = res.data.data;
    if (ids.length === data.length) {
      return true;
    }
    setIdsWithReqNotMet(
      ids.filter((id) => !data.map((item: any) => item.id).includes(id))
    );
    return false;
  };

  const idCheckModal = () => {
    return (
      <div>
        <Modal
          open={showIdExportModal}
          setOpen={setShowIdExportModal}
          size={"sm"}
          children={idCheckModalBody}
          closeButton={false}
          header={<h4>Some of your items cannot be actioned:</h4>}
        />
      </div>
    );
  };

  const checkActionHasExportCriteria = async (
    index: number
  ): Promise<boolean> => {
    const res = await httpClient().get("/action", {
      baseUrl: baseUrl,
    });
    const data = res.data.data;
    return data[index]["attributes"]["params"]["criteria"] ? true : false;
  };

  //@ts-ignore
  const runAction = async (
    action_name: string,
    ids: string[],
    index: number
  ) => {
    setLoading(true);
    setIdsForExport(ids);
    const actionNotReady = await checkActionHasExportCriteria(index);
    setActionNotReady(actionNotReady);
    if (!actionNotReady) {
      await ds.custom("/run-action", "POST", {
        ids: ids,
        action_name: action_name,
        object_type: endpoint,
      });
      setLoading(false);
    } else {
      const allItemsMeetCriteria = await checkIdsMeetCriteria(ids);
      console.log("allItemsMeetCriteria", allItemsMeetCriteria);
      if (!allItemsMeetCriteria) {
        setShowIdExportModal(true);
      }
    }
  };

  const convertStringAction = (
    name: string,
    index: number
  ): DropdownButtonProps =>
    ({
      dropdownButtonName: name,
      action: (ids: string[]) => runAction(name, ids, index),
    }) as DropdownButtonProps;

  const convertAction = (
    action: string | DropdownButtonProps,
    index: number
  ): DropdownButtonProps =>
    typeof action === "string" ? convertStringAction(action, index) : action;

  const convertedActions = actions?.map(convertAction);
  const hasHiddenFields = fields
    ? Object.values(fields).some((field) => field.hidden === true)
    : false;

  return (
    <>
      {idCheckModal()}
      <Table
        id={id}
        data={data}
        fieldMeta={fieldMeta!}
        height={height}
        loading={loading}
        endpoint={endpoint}
        baseUrl={baseUrl}
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
        actions={convertedActions}
        configButtons={configButtons}
        customAttributeSelection={
          hasHiddenFields === true ? [...Object.keys(fields!)] : undefined
        }
      />
    </>
  );
}

export default RemoteTable;
