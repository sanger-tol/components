/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  cellRendererParams,
  Button,
  TCellRenderer,
  IRemoteTarget,
  RemoteFilters,
  IFilter,
  isEmptyObject,
  BUTTONS,
  defineZone,
  AttributeSelector,
  IZone,
  generateFilter,
} from "../..";

export interface PConditionParamScreen extends IRemoteTarget {
  selectedParam: string;
  setSelectedParam: Dispatch<SetStateAction<string | undefined>>;
  renderer: TCellRenderer;
  setRenderer: (renderer: TCellRenderer) => void;
  previousRenderer: TCellRenderer | undefined;
  onPendingChangesChange: (hasPendingChanges: boolean) => void;
}

export function ConditionParamScreen(props: PConditionParamScreen) {
  const {
    selectedParam,
    setSelectedParam,
    renderer,
    setRenderer,
    previousRenderer,
    onPendingChangesChange,
  } = props;

  const zoneFilterId = "cell-renderer-zone";
  const [conditionHasPendingChanges, setConditionHasPendingChanges] = useState(false);

  const initialFilter = (() => {
    if (renderer?.props?.[selectedParam]) {
      const paramValue = renderer.props[selectedParam];
      return typeof paramValue === 'object' ? paramValue as IFilter : { and_: {} };
    }
    return { and_: {} } as IFilter;
  })();

  const [filterConditions, setFilterConditions] = useState<IFilter>(initialFilter);
  const [attributes, setAttributes] = useState<string[]>(Object.keys(initialFilter.and_ || {}));
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: zoneFilterId, filter: initialFilter },
    ]),
  );

  useEffect(() => {
    const newFilter = generateFilter(filterZone, zoneFilterId);
    setFilterConditions(newFilter);

    if (renderer && selectedParam) {
      renderer.props![selectedParam] = newFilter ?? {};
      setRenderer({ ...renderer });
      const hasPending = JSON.stringify(previousRenderer?.props?.[selectedParam]) !== JSON.stringify(renderer.props?.[selectedParam]);
      setConditionHasPendingChanges(hasPending);
      onPendingChangesChange(hasPending);
    }
  }, [filterZone]);

  const onConditionSave = () => {
    // delete empty params if no condition present
    if (isEmptyObject(filterConditions?.and_ || {})) {
      delete renderer.props![selectedParam];
    } else {
      renderer.props![selectedParam] = filterConditions ?? {};
    }
    setRenderer({ ...renderer });
    setSelectedParam(undefined);
    setConditionHasPendingChanges(false);
    onPendingChangesChange(false);
  };

  const onClean = () => {
    const component = filterZone.components[zoneFilterId];
    // We know that the component exists because it is set by default (filterZone state)
    component.data.filter!.and_ = {};
    component.data.defaultFilter!.and_ = {};
    setFilterZone({ ...filterZone });
  };

  return (
    <div className="tol-data-point-renderer-modal-condition-params">
      <div className="tol-param-header">
        <h6 className="tol-param-title">
          Configure Condition for
          '{cellRendererParams[renderer.type].params?.[selectedParam]?.rename}'
          Parameter
        </h6>
      </div>
      <AttributeSelector
        {...props}
        displaySource
        recommendedFilterAvailable
        renderSearchBySource
        attribute={attributes}
        setAttributes={setAttributes}
        populatedFieldType="filter"
        onClean={onClean}
      />
      <RemoteFilters
        {...props}
        utilityBarConfig={undefined}
        zone={filterZone}
        setZone={setFilterZone}
        componentId={zoneFilterId}
        attributes={attributes}
      />
      <Button
        {...BUTTONS.ADD}
        disabled={!conditionHasPendingChanges}
        onClick={onConditionSave}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={() => setSelectedParam(undefined)}
      />
    </div>
  );
}
