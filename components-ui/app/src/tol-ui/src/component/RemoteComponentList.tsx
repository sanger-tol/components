/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement, useMemo, useRef, useState } from "react";
import {
  ComponentList,
  createSort,
  getComponentConfigLocalStorage,
  ListDataConfigDrawer,
  mergeUtilityBarConfigs,
  normaliseFieldMeta,
  Pagination,
  RemoteComponentBase,
  saveComponentConfigLocalStorage,
  useBoard,
  useComponentListData,
  RecordCounter,
} from "..";
import type { IComponentData, IListDataConfigSave, IRemoteComponentDataList, PButton } from "..";


/** Props for the `RemoteComponentDataList` wrapper component. */
export interface PRemoteComponentDataList extends IRemoteComponentDataList {
  /** The single top-level component to enhance with fetched data, e.g. an `<ObjectDetail />`. */
  children: ReactElement<IComponentData>;
  /** Whether to display the page size picker in the utility bar. Defaults to true. */
  pageSizePicker?: boolean;
}

/**
 * Enhances a single top-level component with data fetched via `useComponentListData`.
 * Wraps the result in `RemoteComponentBase` to handle loading, error, and no-fields-selected states.
 * Also provides pagination controls and a record counter when applicable.
 */
export function RemoteComponentDataList(props: PRemoteComponentDataList) {
  const {
    id,
    dataSource,
    objectType,
    fields,
    customDataPointRenderers,
    sortByAttribute,
    sortByType,
    zone,
    setZone,
    page: initialPage,
    pageSize: initialPageSize,
    onConfigSave,
    pageSizePicker,
    children,
    utilityBarConfig,
    height = "100%",
    ...rest
  } = props;

  const { board, editMode } = useBoard();
  const [openConfig, setOpenConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState<IListDataConfigSave>(() => {
    return onConfigSave ? {} : getComponentConfigLocalStorage<IListDataConfigSave>(id) ?? {};
  });

  // External configuration (e.g. a board) must never inherit standalone saved settings.
  const config: IListDataConfigSave = onConfigSave ? {} : savedConfig;
  const configuredPageSize = config.pageSize ?? initialPageSize ?? 50;

  // Normalize the configured metadata from props/storage before passing it to the data hook.
  const activeFieldMeta = useMemo(
    () => normaliseFieldMeta(config.fieldMeta ?? fields),
    [config.fieldMeta, fields],
  );
  // Use the first active field only for the API request when no explicit sort is configured.
  const apiSortByAttribute = config.sortByAttribute ?? sortByAttribute ?? activeFieldMeta.order?.active?.[0];
  const apiSortByType = config.sortByType ?? sortByType ?? "asc";
  const drawerSortByAttribute = config.sortByAttribute ?? sortByAttribute;
  const drawerSortByType = config.sortByType ?? sortByType;

  const {
    // This is still IFieldMeta; the hook adds fetched descriptor defaults to the configured metadata.
    fieldMeta,
    data,
    noFieldsSelected,
    isLoading,
    errorMessage,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalSize,
  } = useComponentListData({
    id,
    objectType,
    dataSource,
    fields: activeFieldMeta,
    zone,
    setZone,
    page: initialPage,
    pageSize: configuredPageSize,
    customDataPointRenderers,
    sortBy: createSort(apiSortByAttribute, apiSortByType),
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination = totalSize !== undefined && totalSize > pageSize;
  const showCounter = totalSize !== undefined && totalSize > 1;
  const showPageSizePicker = configuredPageSize !== 1 && pageSizePicker !== false;

  const onSave = ({
    fieldMeta: nextFieldMeta,
    sortByAttribute,
    sortByType,
    pageSize: nextPageSize
  }: IListDataConfigSave) => {
    const nextConfig: IListDataConfigSave = {
      fieldMeta: nextFieldMeta ?? activeFieldMeta,
      sortByAttribute: sortByAttribute ?? undefined,
      sortByType: sortByType ?? undefined,
      pageSize: nextPageSize ?? configuredPageSize,
    };
    setPage(1);
    setPageSize(nextConfig.pageSize!);
    if (onConfigSave) {
      onConfigSave(nextConfig);
    } else {
      setSavedConfig(nextConfig);
      saveComponentConfigLocalStorage(id, nextConfig);
    }
  };

  const configButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenConfig(true),
    icon: "sliders",
    // Standalone components are always configurable; board components require edit mode.
    visible: !board.id || editMode,
  };

  const ubc = mergeUtilityBarConfigs(utilityBarConfig ?? undefined, {
    buttons: [configButton],
    elements: showPagination
      ? [
        <Pagination
          key="pagination"
          parentRef={parentRef}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalSize={totalSize}
          pageSizePicker={showPageSizePicker}
        />,
      ]
      : [],
  });

  const DataComponent = pageSize > 1
    ? (
      <ComponentList
        id={id}
        page={page}
        data={data}
        fields={fieldMeta}
      >
        {children}
      </ComponentList>
    )
    : cloneElement(children, {
      id,
      data: data[0] ?? {},
      fields: fieldMeta,
    });

  return (
    <div ref={parentRef} className="tol-remote-component-list" style={{ height }}>
      <ListDataConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        fieldMeta={activeFieldMeta}
        sortByAttribute={drawerSortByAttribute}
        sortByType={drawerSortByType}
        pageSize={configuredPageSize}
        onConfigSave={onSave}
      />
      {showCounter && <RecordCounter totalSize={totalSize} loading={isLoading} />}
      <RemoteComponentBase
        {...rest}
        id={id}
        height={height}
        isLoading={isLoading}
        errorMessage={errorMessage}
        noFieldsSelected={noFieldsSelected}
        utilityBarConfig={ubc}
      >
        {DataComponent}
      </RemoteComponentBase>
    </div>
  );
}
