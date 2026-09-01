/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  AttributeSelector,
  RemoteFilters
} from "../..";
import type {
  IZone,
  TsDataSource,
} from "../..";

export interface PCellRendererConditionConfigurer {
  objectType: string,
  dataSource: TsDataSource,
  filterZone: IZone,
  setFilterZone: React.Dispatch<React.SetStateAction<IZone>>,
  componentId: string,
  selectedAttributes: string[] | undefined,
  setSelectedAttributes: React.Dispatch<React.SetStateAction<string[] | undefined>>
}

export function CellRendererConditionConfigurer(props: PCellRendererConditionConfigurer) {
  const {
    objectType,
    dataSource,
    filterZone,
    setFilterZone,
    componentId,
    selectedAttributes,
    setSelectedAttributes,
  } = props;

  return (
    <>
      <AttributeSelector
        objectType={objectType}
        dataSource={dataSource}
        displaySource
        recommendedFilterAvailable
        renderSearchBySource
        attribute={selectedAttributes ?? []}
        setAttributes={setSelectedAttributes}
        populatedFieldType="filter"
        onClean={() => {
          // We know that the component exists because it is set by default (filterZone state)
          const component = filterZone.children[componentId];

          // When the multi-select is cleared, the filter should be reset
          component.filter!.and_ = {};
          component.defaultFilter!.and_ = {};
          setFilterZone({ ...filterZone });
        }}
      />
      <RemoteFilters
        objectType={objectType}
        dataSource={dataSource}
        zone={filterZone}
        setZone={setFilterZone}
        componentId={componentId}
        attributes={selectedAttributes ?? []}
      />
    </>
  );
}
