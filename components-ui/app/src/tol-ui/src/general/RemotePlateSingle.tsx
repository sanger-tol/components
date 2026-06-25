/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  IRemoteTargetAndZone,
  generatePlateData,
  TPlateSize,
  identifyDimension,
  baseDataGenerator,
  Plate,
  TPlateData,
  IWellHoverContents,
  FormatTooltip,
  filterHasUpdated,
  generateFilter,
  resetFiltersBelow,
  TFilterOrUndefined,
  useEffectUpdate,
  addSubFilter,
  generateWellFilter,
  mergeFilters,
} from "..";

export interface PRemotePlateSingle extends IRemoteTargetAndZone {
  id: string;
  plateId: string;
  plateAttribute: string;
  wellPositionAttribute: string;
  wellHoverAttributeKeys?: string[];
  size?: TPlateSize;
}

export function RemotePlateSingle(Props: PRemotePlateSingle) {
  const {
    id,
    plateId,
    plateAttribute,
    wellPositionAttribute,
    wellHoverAttributeKeys = [],
    objectType,
    dataSource,
    zone,
    setZone,
    size = 96,
  } = Props;
  const requestedFields = [
    plateAttribute,
    wellPositionAttribute,
    ...wellHoverAttributeKeys,
  ];
  const pageSize = 1000;

  const [rowLabels, setRowLabels] = useState<String[]>([]);
  const [columnLabels, setColumnLabels] = useState<String[]>([]);
  const [wellData, setWellData] = useState<TPlateData>([]);
  const [filter, setFilter] = useState<TFilterOrUndefined>({});
  const [clickedOnWellId, setClickedOnWellId] = useState<string | undefined>();

  useEffect(() => {
    const compoundedFilter = generateFilter(zone, id);

    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({ id: id, zone: zone! });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    const singlePlateFilter = {
      and_: {
        [plateAttribute]: {
          eq: {
            value: plateId,
          },
        },
      },
    };
    const compoundFilter = mergeFilters(filter || {}, singlePlateFilter);
    const [rows, columns] = identifyDimension(size);
    setRowLabels(rows);
    setColumnLabels(columns);
    const baseData = baseDataGenerator(rows, columns);
    dataSource?.getEntityMeta().then((entityMeta) => {
      dataSource
        .getListPage({
          objectType,
          pageSize,
          filter: compoundFilter,
          requestedFields,
        })
        .then((res) => {
          setWellData(
            generatePlateData(
              objectType,
              entityMeta,
              res,
              baseData,
              wellPositionAttribute,
              wellHoverAttributeKeys
            )
          );
        });
    });
  }, [
    filter,
    size,
    dataSource,
    objectType,
    plateAttribute,
    requestedFields,
    wellPositionAttribute,
  ]);

  useEffectUpdate(() => {
    const localFilter = generateWellFilter(
      clickedOnWellId,
      wellPositionAttribute
    );

    addSubFilter({
      id: id,
      filter: localFilter,
      zone: zone,
    });
    setZone({ ...zone });
  }, [clickedOnWellId]);

  const SingleWellHoverContents = (props: IWellHoverContents) => {
    const { id, data } = props;
    return <FormatTooltip contents={{ id, ...data }} />;
  };

  const onWellClick = (id: string) => {
    setClickedOnWellId(id);
  };

  return (
    <div className="tol-component-contents with-overflow">                                                                                                                      
    <Plate
      id="plate1"
      data={wellData}
      rowLabels={rowLabels}
      columnLabels={columnLabels}
      WellHoverContents={SingleWellHoverContents}
      onWellClick={onWellClick}
    />
    </div>
  );
}
