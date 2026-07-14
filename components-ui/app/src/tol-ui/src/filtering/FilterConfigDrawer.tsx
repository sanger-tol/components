/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle, Input } from "rsuite"
import { useEffect, useRef, useState } from "react";
import {
  IconTooltip,
  IBoardTargetAndZone,
  RemoteFilters,
  Drawer,
  generateFilter,
  resetFiltersBelow,
  deepCopy,
  IFilter,
  AttributeSelector,
  Icon,
  defineZoneWithComponentList,
  IZone,
  FILTER_ALREADY_EXISTS,
  NO_FILTERS_APPLIED,
  IDBBoardEntityFilter,
  upsertBoardEntity,
  deepEqual,
  isEmptyObject,
  JsonEditor,
} from ".."


export interface PFilterConfigDrawer extends IBoardTargetAndZone {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function FilterConfigDrawer(props: PFilterConfigDrawer) {
  const {
    id,
    objectType,
    zone,
    setZone,
    boardObjectType,
    boardDataSource,
    open,
    setOpen,
  } = props;

  const getInitialFilter = () =>
    deepCopy(
      boardObjectType === "zone"
        ? zone.defaultFilter
        : zone.children?.[id]?.defaultFilter,
    );

  const normaliseFilter = (filter?: IFilter) => {
    if (!filter?.and_ || Object.keys(filter.and_).length === 0) {
      return undefined;
    }
    return filter;
  };

  // The fixed filter present on the component
  const [savedFilters, setSavedFilters] = useState(getInitialFilter);
  const [attributes, setAttributes] = useState<string[]>(
    Object.keys(savedFilters?.and_ || {})
  );

  // Only apply filter to the current component
  const [passThrough, setPassThrough] = useState<boolean>(false);
  const initialPassThroughRef = useRef(
    boardObjectType === "zone"
      ? false
      : zone.children?.[id]?.filterPassThrough || false,
  );

  const [includeIncomingFilters, setIncludeIncomingFilters] = useState<boolean>(true);
  const [advancedTranslations, setAdvancedTranslations] = useState<boolean>(false);
  const [translationsText, setTranslationsText] = useState<string>("");

  // Local state for the filter zone if this is a zone level filter, otherwise use the passed zone/setZone
  const [currentFilterZone, setCurrentFilterZone] = useState<IZone>(
    defineZoneWithComponentList(
      "dummy-object-for-remote-filters",
      [{ id: id, filter: savedFilters }]
    ),
  );
  const currentFilters = normaliseFilter(generateFilter(currentFilterZone, id));
  const initialFilters = normaliseFilter(savedFilters);

  const hasPendingChanges = (
    !deepEqual(currentFilters, initialFilters) ||
    passThrough !== initialPassThroughRef.current
  );

  useEffect(() => {
    const initialFilters = getInitialFilter();
    setSavedFilters(initialFilters);
    setAttributes(Object.keys(initialFilters?.and_ || {}));
    setDisabledFilterValues(
      removeCurrentEntityFiltersForDisabledFilters(
        generateFilter(zone, id, true)?.and_!,
        initialFilters?.and_!,
      ),
    );
    const initialPassThrough = boardObjectType === "zone"
      ? false
      : zone.children?.[id]?.filterPassThrough || false;
    initialPassThroughRef.current = initialPassThrough;
    setPassThrough(initialPassThrough);
    setCurrentFilterZone(
      defineZoneWithComponentList(
        "dummy-object-for-remote-filters",
        [{ id: id, filter: initialFilters }]
      )
    );
  }, [open]);

  const removeCurrentEntityFiltersForDisabledFilters = (
    source: object = {},
    remove?: object,
  ) => {
    const keysToRemove = new Set(Object.keys(remove || {}));
    return Object.fromEntries(
      Object.entries(source).filter(([key]) => !keysToRemove.has(key)),
    );
  };

  // getting the disabled filter values (currently all other entity filters)
  const [disabledFilterValues, setDisabledFilterValues] = useState(
    removeCurrentEntityFiltersForDisabledFilters(
      generateFilter(currentFilterZone, undefined, true)?.and_!,
      savedFilters?.and_!,
    ),
  );

  const onSave = (filter: IFilter, filterPassThrough: boolean) => {
    let attributes: IDBBoardEntityFilter = {
      filter: filter
    };
    if (boardObjectType === "zone") {
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
    } else {
      zone.children[id].filter = deepCopy(filter);
      zone.children[id].defaultFilter = deepCopy(filter);
      zone.children[id].filterPassThrough = filterPassThrough;
      attributes.filter_pass_through = filterPassThrough;
    }
    resetFiltersBelow({ id: id, zone: zone });
    setZone({ ...zone });
    upsertBoardEntity(boardDataSource, id, attributes);
  };

  // Function passed to attribute selector to remove all filters
  const onClean = () => {
    setAttributes([]);
    setCurrentFilterZone((prev) => {
      const updatedZone = deepCopy(prev);
      if (boardObjectType === "zone") {
        updatedZone.filter = { and_: {} };
        updatedZone.defaultFilter = { and_: {} };
      } else {
        if (updatedZone.children?.[id]?.filter) {
          updatedZone.children[id].filter.and_ = {};
        }
        if (updatedZone.children?.[id]?.defaultFilter) {
          updatedZone.children[id].defaultFilter.and_ = {};
        }
      }
      return updatedZone;
    });
  };

  const removeFilter = (attribute: string) => {
    setAttributes((prev) => prev.filter((str) => str !== attribute));
    setCurrentFilterZone((prev) => {
      const updatedZone = deepCopy(prev);
      if (boardObjectType === "zone") {
        delete updatedZone.filter?.and_?.[attribute];
        delete updatedZone.defaultFilter?.and_?.[attribute];
      } else {
        delete updatedZone.children?.[id]?.filter?.and_?.[attribute];
        delete updatedZone.children?.[id]?.defaultFilter?.and_?.[attribute];
      }
      return updatedZone;
    });
  };

  // Element to be passed to each remote filter to allow for individual removal of filters
  const removeCross = ({ attribute }: { attribute: string }) => (
    <Icon icon="close" onClick={() => { removeFilter(attribute) }} className="remove-filter-button" />
  );

  const filterPassThroughToggle = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-pass-through-toggle"
        onClick={() => {
          setPassThrough(!passThrough);
          setZone({ ...zone });
        }}
        checked={passThrough}
      />
      <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
        Apply these filters only to this Component.
      </span>
      <IconTooltip
        contents={
          "Toggling this on means this filter does not affect other components in the heirarchy. Filters from above are still applied."
        }
      />
      <hr style={{ marginTop: 24 }} />
    </div>
  )

  const incomingFiltersToggle = (
    <>
      <div className="tol-toggle-option">
        <Toggle
          key="tol-incoming-filters-toggle"
          onClick={() => {
            setIncludeIncomingFilters(!includeIncomingFilters);
          }}
          checked={includeIncomingFilters}
        />
        <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
          Include incoming filters.
        </span>
        <IconTooltip
          contents={
            "Toggling this off means you will not use any incoming filters from the Zone above."
          }
        />
      </div>
      {includeIncomingFilters && (
        <div className="tol-toggle-option">
          <Toggle
            key="tol-advanced-translations-toggle"
            onClick={() => {
              setAdvancedTranslations(!advancedTranslations);
            }}
            checked={advancedTranslations}
          />
          <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
            Use advanced translations.
          </span>
          <IconTooltip
            contents={
              "Toggling this allows you to specify a mapping of custom translations. These are prioritised over automatic translations."
            }
          />
          {advancedTranslations && (
            <Input
              className="tol-filter-translations-input"
              as="textarea"
              rows={translationsText ? 6 : 1}
              placeholder={`{"incomingField": "currentField"}`}
              value={translationsText}
              onChange={setTranslationsText}
            />
          )}
        </div>
      )}
      <hr style={{ marginTop: 24 }} />
    </>
  )

  return (
    <div>
      <Drawer
        title={`Filtering on a ${objectType} ${boardObjectType}`}
        open={open}
        setOpen={setOpen}
        onSave={() => onSave(currentFilters || { and_: {} }, passThrough)}
        hasPendingChanges={hasPendingChanges}
        onSaveTestId="apply-filter-button"
      >
        {boardObjectType === "zone" ? incomingFiltersToggle : filterPassThroughToggle}
        <AttributeSelector
          {...props}
          displaySource
          recommendedFilterAvailable
          renderSearchBySource
          disabledValues={disabledFilterValues}
          placeholder={NO_FILTERS_APPLIED}
          attribute={attributes}
          setAttributes={setAttributes}
          populatedFieldType="filter"
          numPopulatedFields={
            Object.keys(
              zone.children?.[id]?.filter?.and_ || {},
            ).length
          }
          tooltipContent={FILTER_ALREADY_EXISTS}
          onClean={onClean}
        />
        <RemoteFilters
          {...props}
          utilityBarConfig={undefined}
          zone={currentFilterZone}
          setZone={setCurrentFilterZone}
          componentId={id}
          attributes={attributes}
          ExtraElement={removeCross}
          className={"tol-filter-config-remote-filter"}
        />
      </Drawer>
    </div>
  );
}
