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
  generateDefaultFilter,
  defineZoneWithComponentList,
  generateFilter,
  isEmptyObject,
  RemoteFilters,
} from "../..";
import type { IFilter, IRemoteTarget, IZone, TCellRenderer } from "../..";

export interface PCellRendererConditionParamOptions extends IRemoteTarget {
  /**
   * The name of the condition cell renderer parameter being edited
   */
  paramName: string;
  /**
   * The object type of the origin (where the cell renderer is displayed, e.g. a table),
   * which may or may not be the same as `objectType` (the object type of this data point)
   */
  originObjectType: string;
  /** The relationship of `objectType` from `originObjectType` */
  relationshipFromOrigin: string;
  /**
   * A reference to the cell renderer being configured
   */
  renderer: TCellRenderer;
  /**
   * The state setter for `renderer`.
   * Like `fieldMeta` in `CellRendererModal`, this is written to by reference,
   * then 'formally updated' with `setRenderer({ ...renderer })`. 
   */
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  /**
   * The previous state of `renderer`, used to detect whether any changes have been made
   */
  previousRenderer: TCellRenderer;
  /**
   * The state of the same name from the parent `CellRendererModal` component. Needed to disable
   * the confirmation button
   */
  hasPendingChanges: boolean;
  /**
   * State setter for `hasPendingChanges`. Updated using `previousRenderer` and `renderer`
   */
  setHasPendingChanges: Dispatch<SetStateAction<boolean>>;
  /**
   * Switches the active page in `CellRendererModal` back to the first one (this is the second)
   */
  goBack: () => void;
}

/**
 * The second page of `CellRendererModal` when a condition parameter is being edited
 */
export function CellRendererConditionParamOptions(props: PCellRendererConditionParamOptions) {
  const {
    paramName,
    originObjectType,
    relationshipFromOrigin,
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
    defineZoneWithComponentList("dummy-object-for-remote-filters", [
      { id: zoneFilterId, filter: renderer?.props?.[paramName!] as IFilter || generateDefaultFilter() },
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
      const filterValue = typeof paramValue === 'object' ? paramValue as IFilter : generateDefaultFilter();
      setAttributes(Object.keys(filterValue.and_ || {}) || []);
      setFilterConditions(filterValue);
      setPreviousFilterConditions(previousRenderer?.props?.[paramName] as IFilter | undefined);
      setFilterZone(defineZoneWithComponentList("dummy-object-for-remote-filters", [
        { id: zoneFilterId, filter: filterValue },
      ]));
    } else {
      setAttributes([]);
      setFilterConditions(generateDefaultFilter());
      setPreviousFilterConditions(generateDefaultFilter());
    }
  }, [paramName]);

  useEffect(() => {
    const newFilter = generateFilter(filterZone, zoneFilterId);
    setFilterConditions(newFilter);
    setHasPendingChanges(() => {
      if (!renderer || !paramName) return false;
      renderer!.props![paramName!] = newFilter ?? {};
      setRenderer({ ...renderer });
      return JSON.stringify(previousFilterConditions) !== JSON.stringify(newFilter);
    });
  }, [filterZone]);

  // Needed for the BottomButtons. Either adding the parameter or going back means that the filter
  // making up the parameter should be cleared (it gets tied to the renderer somehow!)
  const resetFilterZone = () => setFilterZone(defineZoneWithComponentList("dummy-object-for-remote-filters", [
    { id: zoneFilterId, filter: generateDefaultFilter() },
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
    <div className="tol-data-point-renderer-modal-bottom-buttons">
      <Button
        {...BUTTONS.ADD}
        disabled={!hasPendingChanges}
        onClick={handleSave}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={handleBack}
      />
    </div>
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
          const component = filterZone.children[zoneFilterId];

          // When the multi-select is cleared, the filter should be reset
          component.filter!.and_ = {};
          component.defaultFilter!.and_ = {};
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
