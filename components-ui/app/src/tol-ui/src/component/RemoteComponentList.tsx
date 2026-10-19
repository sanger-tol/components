/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { cloneElement, ReactElement, useMemo, useRef, useState } from "react";
import {
  ComponentList,
  createSort,
  DEFAULT_PAGE_SIZE,
  getComponentConfigLocalStorage,
  ListDataConfigDrawer,
  mergeUtilityBarConfigs,
  normaliseFieldMeta,
  Pagination,
  RecordCounter,
  RemoteComponentBase,
  saveComponentConfigLocalStorage,
  useBoard,
  useComponentListData,
} from "..";
import type { IComponentData, IFieldMeta, IListDataConfigSave, IRemoteComponentDataList, PButton, TDataObjectListOrNull } from "..";


/** Props for the `RemoteComponentDataList` wrapper component. */
export interface PRemoteComponentDataList extends IRemoteComponentDataList {
  /** The single top-level component to enhance with fetched data, e.g. an `<ObjectDetail />`. */
  children: ReactElement<IComponentData>;
  /** Whether to display the page size picker in the utility bar. Defaults to true. */
  pageSizePicker?: boolean;
  /** The page size the wrapped component defaults to when none is saved or passed via `defaultPageSize`. */
  componentDefaultPageSize?: number;
  /** To adapt the fieldMeta for display purposes without affecting the underlying configuration. */
  manipulateViewableFieldMeta?: (fieldMeta: IFieldMeta, dataObjects?: TDataObjectListOrNull) => IFieldMeta;
}

/**
 * Enhances a single top-level component with data fetched via `useComponentListData`.
 * Wraps the result in `RemoteComponentBase` to handle loading, error, and no-fields-selected states.
 * Also provides pagination controls and a record counter when applicable.
 */
export function RemoteComponentDataList(props: PRemoteComponentDataList) {
  const {
    id,
    fields,
    defaultSortByAttribute,
    defaultSortByType,
    page: initialPage,
    defaultPageSize,
    componentDefaultPageSize,
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

  // Normalize the configured metadata from props/storage before passing it to the data hook.
  const activeFieldMeta = useMemo(
    () => normaliseFieldMeta(config.fieldMeta ?? fields),
    [config.fieldMeta, fields],
  );

  // Only a saved or passed-in default; the drawer shows no page size unless one is set.
  const configuredDefaultPageSize = config.defaultPageSize ?? defaultPageSize;
  // The component and global defaults are only a fallback for the page size state.
  const apiPageSize = configuredDefaultPageSize ?? componentDefaultPageSize ?? DEFAULT_PAGE_SIZE;

  // Use the first active field only for the API request when no explicit sort is configured.
  const configuredDefaultSortByAttribute = config.defaultSortByAttribute ?? defaultSortByAttribute;
  const configuredDefaultSortByType = config.defaultSortByType ?? defaultSortByType;
  const apiSortByAttribute = configuredDefaultSortByAttribute ?? activeFieldMeta.order?.active?.[0];
  const apiSortByType = configuredDefaultSortByType ?? "asc";

  const {
    // This is still IFieldMeta; the hook adds fetched descriptor defaults to the configured metadata.
    fieldMeta,
    unmanipulatedFieldMeta,
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
    ...rest,
    id,
    fields: activeFieldMeta,
    page: initialPage,
    pageSize: apiPageSize,
    sortBy: createSort(apiSortByAttribute, apiSortByType),
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination = totalSize !== undefined && totalSize > pageSize;
  const showCounter = totalSize !== undefined && totalSize > 1;
  const showPageSizePicker = apiPageSize !== 1 && pageSizePicker !== false;

  const onSave = ({
    fieldMeta: nextFieldMeta,
    defaultSortByAttribute: nextDefaultSortByAttribute,
    defaultSortByType: nextDefaultSortByType,
    defaultPageSize: nextDefaultPageSize,
  }: IListDataConfigSave) => {
    const nextConfig: IListDataConfigSave = {
      fieldMeta: nextFieldMeta ?? activeFieldMeta,
      defaultSortByAttribute: nextDefaultSortByAttribute ?? undefined,
      defaultSortByType: nextDefaultSortByType ?? undefined,
      defaultPageSize: nextDefaultPageSize,
    };
    setPage(1);
    if (nextDefaultPageSize) setPageSize(nextDefaultPageSize);
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
        // Use the raw save values for the config drawer, not the manipulated ones.
        fieldMeta={unmanipulatedFieldMeta}
        defaultSortByAttribute={configuredDefaultSortByAttribute}
        defaultSortByType={configuredDefaultSortByType}
        defaultPageSize={configuredDefaultPageSize}
        onConfigSave={onSave}
      />
      {showCounter && (
        <RecordCounter
          totalSize={totalSize}
          page={page}
          pageSize={pageSize}
          loading={isLoading}
        />
      )}
      <RemoteComponentBase
        id={id}
        height={height}
        isLoading={isLoading}
        errorMessage={errorMessage}
        noFieldsSelected={noFieldsSelected}
        noData={data.length === 0}
        utilityBarConfig={ubc}
        {...rest}
      >
        {DataComponent}
      </RemoteComponentBase>
    </div>
  );
}
