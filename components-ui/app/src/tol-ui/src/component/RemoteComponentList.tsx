/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { cloneElement, ComponentType, ReactElement, useMemo, useRef, useState } from "react";
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
import type { IComponentData, IFieldMeta, TListDataConfigSave, TRemoteComponentDataList, PButton, TAdditionalOptionsContent, TDataObjectListOrNull } from "..";


/** Props for the `RemoteComponentDataList` wrapper component. */
export type PRemoteComponentDataList<TAdditionalOptions> =
  TRemoteComponentDataList<TAdditionalOptions> & {
  /** The single top-level component to enhance with fetched data, e.g. an `<ObjectDetail />`. */
  children: ReactElement<IComponentData>;
  /** Whether to display the page size picker in the utility bar. Defaults to true. */
  pageSizePicker?: boolean;
  /** The page size the wrapped component defaults to when none is saved or passed via `defaultPageSize`. */
  componentDefaultPageSize?: number;
  /** To adapt the fieldMeta for display purposes without affecting the underlying configuration. */
  manipulateViewableFieldMeta?: (fieldMeta: IFieldMeta, dataObjects?: TDataObjectListOrNull) => IFieldMeta;
  /** Editor for the component-specific options. */
  AdditionalOptionsContent?: ComponentType<TAdditionalOptionsContent<TAdditionalOptions>>;
};

/**
 * Enhances a single top-level component with data fetched via `useComponentListData`.
 * Wraps the result in `RemoteComponentBase` to handle loading, error, and no-fields-selected states.
 * Also provides pagination controls and a record counter when applicable.
 */
export function RemoteComponentDataList<TAdditionalOptions>(
  props: PRemoteComponentDataList<TAdditionalOptions>,
) {
  const {
    id,
    fields,
    defaultSortByAttribute,
    defaultSortByType,
    page: initialPage,
    defaultPageSize,
    componentDefaultPageSize,
    AdditionalOptionsContent,
    onConfigSave,
    pageSizePicker,
    children,
    utilityBarConfig,
    height = "100%",
    ...rest
  } = props;

  const { board, editMode } = useBoard();
  const [openConfig, setOpenConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState<TListDataConfigSave<TAdditionalOptions>>(() => {
    return (onConfigSave ? {} : getComponentConfigLocalStorage<TListDataConfigSave<TAdditionalOptions>>(id) ?? {}) as TListDataConfigSave<TAdditionalOptions>;
  });

  // External configuration (e.g. a board) must never inherit standalone saved settings.
  const config: TListDataConfigSave<TAdditionalOptions> = (onConfigSave ? {} : savedConfig) as TListDataConfigSave<TAdditionalOptions>;
  const {
    fieldMeta: configuredFieldMeta,
    defaultSortByAttribute: savedDefaultSortByAttribute,
    defaultSortByType: savedDefaultSortByType,
    defaultPageSize: savedDefaultPageSize,
    ...savedAdditionalOptions
  } = config;
  const configuredAdditionalOptions = savedAdditionalOptions as TAdditionalOptions;

  // Normalize the configured metadata from props/storage before passing it to the data hook.
  const activeFieldMeta = useMemo(
    () => normaliseFieldMeta(configuredFieldMeta ?? fields),
    [configuredFieldMeta, fields],
  );

  // Only a saved or passed-in default; the drawer shows no page size unless one is set.
  const configuredDefaultPageSize = savedDefaultPageSize ?? defaultPageSize;
  // The component and global defaults are only a fallback for the page size state.
  const apiPageSize = configuredDefaultPageSize ?? componentDefaultPageSize ?? DEFAULT_PAGE_SIZE;

  // Use the first active field only for the API request when no explicit sort is configured.
  const configuredDefaultSortByAttribute = savedDefaultSortByAttribute ?? defaultSortByAttribute;
  const configuredDefaultSortByType = savedDefaultSortByType ?? defaultSortByType;
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
    ...nextAdditionalOptions
  }: TListDataConfigSave<TAdditionalOptions>) => {
    const nextConfig = {
      fieldMeta: nextFieldMeta ?? activeFieldMeta,
      defaultSortByAttribute: nextDefaultSortByAttribute ?? undefined,
      defaultSortByType: nextDefaultSortByType ?? undefined,
      defaultPageSize: nextDefaultPageSize,
      ...nextAdditionalOptions,
    } as TListDataConfigSave<TAdditionalOptions>;
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
        {cloneElement(children, configuredAdditionalOptions as Partial<IComponentData>)}
      </ComponentList>
    )
    : cloneElement(children, {
      ...configuredAdditionalOptions,
      id,
      data: data[0] ?? {},
      fields: fieldMeta,
    });

  return (
    <div ref={parentRef} className="tol-remote-component-list" style={{ height }}>
      <ListDataConfigDrawer<TAdditionalOptions>
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        // Use the raw save values for the config drawer, not the manipulated ones.
        fieldMeta={unmanipulatedFieldMeta}
        defaultSortByAttribute={configuredDefaultSortByAttribute}
        defaultSortByType={configuredDefaultSortByType}
        defaultPageSize={configuredDefaultPageSize}
        additionalOptions={configuredAdditionalOptions}
        AdditionalOptionsContent={AdditionalOptionsContent}
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
