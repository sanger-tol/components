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
  isEmptyObject,
  RemoteFilters,
  Tabs,
  IconTooltip,
} from "../..";
import type { IDataPointConditionProp, IFilter, IRemoteTarget, IZone, TCellRenderer } from "../..";

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
    goBack,
    objectType,
    dataSource
  } = props;

  /*
   * A mock zone with an arbitrary object type, used to house two components.
   * There is one component for each tab, and is used to store the filter from that tab.
   * The two filters making up the condition are stored within this zone.
   * (If you need to retrieve them, use the `getCondition` helper)
   */
  const currentFilterComponentId = "filterForCurrent";
  const originFilterComponentId = "filterForOrigin";
  const [filterZone, setFilterZone] = useState<IZone>(defineZoneWithComponentList(
    "dummy_object_type",
    [
      {
        id: currentFilterComponentId,
        filter: (renderer?.props?.[paramName!] as IDataPointConditionProp | undefined)?.filterForCurrent || generateDefaultFilter()
      },
      {
        id: originFilterComponentId,
        filter: (renderer?.props?.[paramName!] as IDataPointConditionProp | undefined)?.filterForOrigin || generateDefaultFilter()
      }
    ]
  ));

  const getCondition = (): IDataPointConditionProp => ({
    filterForCurrent: deepCopy(
      filterZone.children[currentFilterComponentId].filter ?? generateDefaultFilter()
    ),
    filterForOrigin: deepCopy(
      filterZone.children[originFilterComponentId].filter ?? generateDefaultFilter()
    ),
  });

  const updateFilterZone = (currentFilters: IFilter, originFilters: IFilter) => {
    setFilterZone(defineZoneWithComponentList(
      "dummy_object_type",
      [
        {
          id: currentFilterComponentId,
          filter: currentFilters,
        },
        {
          id: originFilterComponentId,
          filter: originFilters,
        }
      ]
    ));
  }
  // Needed for the BottomButtons. Either adding the parameter or going back means that the filter
  // making up the parameter should be cleared (it gets tied to the renderer somehow!)
  const resetFilterZone = () => updateFilterZone(generateDefaultFilter(), generateDefaultFilter());

  // The attributes we're filtering on for both tabs.
  // The initial values are set in the useEffect below.
  const [attributesSelectedForCurrent, setAttributesSelectedForCurrent] = useState<string[]>();
  const [attributesSelectedForOrigin, setAttributesSelectedForOrigin] = useState<string[]>();

  // Save a copy of the renderer before the filters are applied.
  // Because filter settings are changed by reference, if we go back to the first page, even without
  // setting any state, the changes will still apply. Then, the renderer is set to the value
  // stored here.
  const [rendererBeforeChanges, _setRendererBeforeChanges] = useState(deepCopy(renderer));

  // Save a copy of this condition before any changes have been made,
  // which can be used to determine whether there are pending changes.
  const conditionBeforeChanges = rendererBeforeChanges?.props?.[paramName] as IDataPointConditionProp | undefined;
  const previousFiltersForCurrent = conditionBeforeChanges?.filterForCurrent ?? generateDefaultFilter();
  const previousFiltersForOrigin = conditionBeforeChanges?.filterForOrigin ?? generateDefaultFilter();

  // Runs upon opening the second page of the modal (to configure a new condition);
  // Checks that the condition exists and has a value, and stops the condition filters spreading across all conditions.
  // It also sets up states.
  useEffect(() => {
    const conditionExists = renderer?.props?.[paramName!] && paramName;
    if (conditionExists) {
      // Extract the filter information that may already exist for this condition
      const storedCondition = renderer!.props![paramName!];
      const storedFiltersForCurrent = typeof storedCondition == "object"
        ? (storedCondition as IDataPointConditionProp).filterForCurrent
        : generateDefaultFilter();
      const storedFiltersForOrigin = typeof storedCondition == "object"
        ? (storedCondition as IDataPointConditionProp).filterForOrigin
        : generateDefaultFilter();

      // Set the states using this information
      setAttributesSelectedForCurrent(Object.keys(storedFiltersForCurrent.and_ ?? {}) || []);
      setAttributesSelectedForOrigin(Object.keys(storedFiltersForOrigin.and_ ?? {}) || []);
      updateFilterZone(storedFiltersForCurrent, storedFiltersForOrigin);

    } else { // Set all the states to be blank
      setAttributesSelectedForCurrent([]);
      setAttributesSelectedForOrigin([]);
    }
  }, [paramName]);

  // Update the pending-change state when either filter changes.
  useEffect(() => {
    const newFiltersForCurrent = deepCopy(
      filterZone.children[currentFilterComponentId].filter ?? generateDefaultFilter()
    );
    const newFiltersForOrigin = deepCopy(
      filterZone.children[originFilterComponentId].filter ?? generateDefaultFilter()
    );

    setHasPendingChanges(
      JSON.stringify(previousFiltersForCurrent) !== JSON.stringify(newFiltersForCurrent)
      || JSON.stringify(previousFiltersForOrigin) !== JSON.stringify(newFiltersForOrigin)
    );
  }, [filterZone]);

  const handleBack = () => {
    resetFilterZone();
    setRenderer(rendererBeforeChanges);
    setHasPendingChanges(false);
    goBack();
  };

  const handleSave = () => {
    // Save the changes to the condition filters.
    // If there's nothing in either filter, delete the param in the renderer to show that there
    // is no condition (this will change the button on the previous page from Edit Condition to Add Condition).
    const condition = getCondition();

    if (
      isEmptyObject(condition.filterForCurrent.and_ || {})
      && isEmptyObject(condition.filterForOrigin.and_ || {})
    ) {
      delete renderer!.props![paramName!];
    } else {
      renderer!.props![paramName!] = condition;
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
          <IconTooltip
            className="tol-ml-sm"
            contents={
              <p>
                A Condition is a filter. If it passes, the Condition is true. If it does not, it is false.<br/>
                Filters can either be from the perspective of this Data Point (configured in the Current tab),
                or from the overall table (configured in the Origin tab).
              </p>
            }
          />
        </h6>
      </div>
      <Tabs defaultActiveKey="current">
        <Tabs.Tab eventKey="current" title="Current">
          <AttributeSelector
            objectType={objectType}
            dataSource={dataSource}
            displaySource
            recommendedFilterAvailable
            renderSearchBySource
            attribute={attributesSelectedForCurrent ?? []}
            setAttributes={setAttributesSelectedForCurrent}
            populatedFieldType="filter"
            onClean={() => {
              // We know that the component exists because it is set by default (filterZone state)
              const component = filterZone.children[currentFilterComponentId];

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
            componentId={currentFilterComponentId}
            attributes={attributesSelectedForCurrent ?? []}
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="origin" title="Origin">
          <p>TODO!</p>
        </Tabs.Tab>
      </Tabs>
      {BottomButtons}
    </div>
  )
}
