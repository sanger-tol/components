/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement, useEffect, useRef, useState } from "react";
import {
  createSort,
  getComponentConfigLocalStorage,
  ListDataConfigDrawer,
  mergeUtilityBarConfigs,
  Pagination,
  RemoteComponentBase,
  saveComponentConfigLocalStorage,
  useBoard,
  useComponentListData,
} from "..";
import { RecordCounter } from "./RecordCounter";
import type { IComponentData, IListDataConfigSave, IRemoteComponentDataList, PButton } from "..";


/** Props for the `RemoteComponentDataList` wrapper component. */
export interface PRemoteComponentDataList extends IRemoteComponentDataList {
  /** The single top-level component to enhance with fetched data, e.g. an `<ObjectDetail />`. */
  children: ReactElement<IComponentData>;
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
    defaultSortByAttribute,
    defaultSortByType,
    zone,
    setZone,
    children,
    utilityBarConfig,
    height = "100%",
    ...rest
  } = props;

  const { board, editMode } = useBoard();
  const [openConfig, setOpenConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState<IListDataConfigSave>(() => {
    const storedConfig = getComponentConfigLocalStorage<IListDataConfigSave>(id) ?? {};
    return {
      fieldMeta: storedConfig.fieldMeta ?? fields,
      defaultSortByAttribute: storedConfig.defaultSortByAttribute ?? defaultSortByAttribute,
      defaultSortByType: storedConfig.defaultSortByType ?? defaultSortByType,
    };
  });

  useEffect(() => {
    setSavedConfig((current) => ({
      ...current,
      fieldMeta: current.fieldMeta ?? fields,
      defaultSortByAttribute: current.defaultSortByAttribute ?? defaultSortByAttribute,
      defaultSortByType: current.defaultSortByType ?? defaultSortByType,
    }));
  }, [fields, defaultSortByAttribute, defaultSortByType]);

  const activeFieldMeta = savedConfig.fieldMeta ?? fields ?? { order: { active: [] } };
  // Use the first active field only for the API request when no explicit sort is configured.
  const apiSortByAttribute = savedConfig.defaultSortByAttribute ?? defaultSortByAttribute ?? activeFieldMeta.order?.active?.[0];
  const apiSortByType = savedConfig.defaultSortByType ?? defaultSortByType ?? "asc";
  const drawerSortByAttribute = savedConfig.defaultSortByAttribute ?? defaultSortByAttribute;
  const drawerSortByType = savedConfig.defaultSortByType ?? defaultSortByType;

  const {
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
    customDataPointRenderers,
    sortBy: createSort(apiSortByAttribute, apiSortByType),
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const showPagination = totalSize !== undefined && totalSize > 1;

  const onConfigSave = ({ fieldMeta: nextFieldMeta, defaultSortByAttribute, defaultSortByType }: IListDataConfigSave) => {
    const nextConfig: IListDataConfigSave = {
      fieldMeta: nextFieldMeta ?? activeFieldMeta,
      defaultSortByAttribute: defaultSortByAttribute ?? undefined,
      defaultSortByType: defaultSortByType ?? undefined,
    };
    setSavedConfig(nextConfig);
    saveComponentConfigLocalStorage(id, nextConfig);
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
          pageSizePickerVisible={false}
        />,
      ]
      : [],
  });

  return (
    <div ref={parentRef} className="tol-remote-component-list" style={{ height }}>
      <ListDataConfigDrawer
        {...props}
        open={openConfig}
        setOpen={setOpenConfig}
        fieldMeta={activeFieldMeta}
        defaultSortByAttribute={drawerSortByAttribute}
        defaultSortByType={drawerSortByType}
        onConfigSave={onConfigSave}
      />
      {showPagination && <RecordCounter totalSize={totalSize} loading={isLoading} />}
      <RemoteComponentBase
        {...rest}
        id={id}
        height={height}
        isLoading={isLoading}
        errorMessage={errorMessage}
        noFieldsSelected={noFieldsSelected}
        utilityBarConfig={ubc}
      >
        {cloneElement(children, {
          id,
          data: data[0] ?? {},
          fields: fieldMeta,
        })}
      </RemoteComponentBase>
    </div>
  );
}
