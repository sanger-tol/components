/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  AttributeSelector,
  Button,
  BUTTONS,
  cellRendererParams,
  deepCopy,
  defineZone,
  generateFilter,
  isEmptyObject,
  RemoteFilters,
} from "../..";
import type { IFilter, IRemoteTarget, IZone, TCellRenderer } from "../..";

export interface PCellRendererConditionParamOptions extends IRemoteTarget {
  paramName: string;
  renderer: TCellRenderer;
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  previousRenderer: TCellRenderer;
  hasPendingChanges: boolean;
  setHasPendingChanges: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}

export function CellRendererConditionParamOptions(props: PCellRendererConditionParamOptions) {
  const {
    paramName,
    renderer,
    setRenderer,
    hasPendingChanges,
    setHasPendingChanges,
    previousRenderer,
    goBack,
    objectType,
    dataSource
  } = props;

  // Filters must be associated with a zone,
  // so here's a zone to assign the filters to while we're defining them
  const zoneFilterId = "cell-renderer-component";
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: zoneFilterId, filter: renderer?.props?.[paramName!] as IFilter || { and_: {} } },
    ]),
  );
  // The filters used for this condition
  const [filterConditions, setFilterConditions] = useState<IFilter>();
  const [previousFilterConditions, setPreviousFilterConditions] = useState<IFilter>();
  // The attributes displayed in AttributeSelector
  const [attributes, setAttributes] = useState<string[]>(Object.keys(filterConditions?.and_ || {}));
  // Save a copy of the renderer before the filters are applied.
  // Because filter settings are changed by reference, if we go back to the first page, even without
  // setting any state, the changes will still apply. Then, the renderer is set to the value
  // stored here.
  const [rendererBeforeChanges, _setRendererBeforeChanges] = useState(deepCopy(renderer));

  // Checks that the condition exists and has a value, stops the condition filters spreading across all conditions
  useEffect(() => {
    if (renderer?.props?.[paramName!] && paramName) {
      const paramValue = renderer.props[paramName];
      const filterValue = typeof paramValue === 'object' ? paramValue as IFilter : { and_: {} };
      setAttributes(Object.keys(filterValue.and_ || {}) || []);
      setFilterConditions(filterValue);
      setPreviousFilterConditions(previousRenderer?.props?.[paramName] as IFilter | undefined);
      setFilterZone(defineZone("dummy-object-for-remote-filters", [
        { id: zoneFilterId, filter: filterValue },
      ]));
    } else {
      setAttributes([]);
      setFilterConditions({ and_: {} });
      setPreviousFilterConditions({ and_: {} });
    }
  }, [paramName]);

  useEffect(() => {
    const newFilter = generateFilter(filterZone, zoneFilterId);
    setFilterConditions(newFilter);
    setHasPendingChanges(() => {
      if (!renderer || !paramName) return false;
      renderer!.props![paramName!] = newFilter ?? {};
      setRenderer({ ...renderer });
      // return JSON.stringify(previousRenderer?.props?.[selectedConditionParam]) !== JSON.stringify(renderer.props?.[selectedConditionParam])
      return JSON.stringify(previousFilterConditions) !== JSON.stringify(newFilter);
    });
  }, [filterZone]);

  // Needed for the BottomButtons. Either adding the parameter or going back means that the filter
  // making up the parameter should be cleared (it gets tied to the renderer somehow!)
  const resetFilterZone = () => setFilterZone(defineZone("dummy-object-for-remote-filters", [
    { id: zoneFilterId, filter: { and_: {} } },
  ]));

  const handleBack = () => {
    resetFilterZone();
    setRenderer(rendererBeforeChanges);
    setHasPendingChanges(false);
    goBack();
  };

  const handleSave = () => {
    // delete empty params if no condition present
    if (isEmptyObject(filterConditions?.and_ || {})) {
      delete renderer!.props![paramName!];
    } else {
      renderer!.props![paramName!] = filterConditions ?? {};
    }
    setRenderer({ ...renderer! });
    setHasPendingChanges(false);
    resetFilterZone();
    goBack();
  };

  const BottomButtons = (
    <>
      <Button
        {...BUTTONS.ADD}
        disabled={!hasPendingChanges}
        onClick={handleSave}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={handleBack}
      />
    </>
  );

  return (
    <div className="tol-data-point-renderer-modal-condition-param-options">
      <div className="tol-param-header">
        <h6 className="tol-param-title">
          Configure Condition for
          '{cellRendererParams[renderer?.type!].params?.[paramName]?.rename}'
          Parameter
        </h6>
      </div>
      <AttributeSelector
        objectType={objectType}
        dataSource={dataSource}
        displaySource
        recommendedFilterAvailable
        renderSearchBySource
        attribute={attributes}
        setAttributes={setAttributes}
        populatedFieldType="filter"
        onClean={() => {
          // We know that the component exists because it is set by default (filterZone state)
          const component = filterZone.components[zoneFilterId];

          // When the multi-select is cleared, the filter should be reset
          component.data.filter!.and_ = {};
          component.data.defaultFilter!.and_ = {};
          setFilterZone({ ...filterZone });
        }}
      />
      <RemoteFilters
        objectType={objectType}
        dataSource={dataSource}
        utilityBarConfig={undefined}
        zone={filterZone}
        setZone={setFilterZone}
        componentId={zoneFilterId}
        attributes={attributes}
      />
      {BottomButtons}
    </div>
  )
}
