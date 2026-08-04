/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle, Input } from "rsuite"
import { useEffect, useRef, useState } from "react";
import {
  cleanFilterAttributesFromBoardEntity,
  IconTooltip,
  IBoardTargetAndZone,
  RemoteFilters,
  Drawer,
  deleteFilterAttributeFromBoardEntity,
  generateFilter,
  resetFiltersBelow,
  deepCopy,
  IFilter,
  AttributeSelector,
  defineZoneWithComponentList,
  IZone,
  FILTER_ALREADY_EXISTS,
  NO_FILTERS_APPLIED,
  IDBBoardEntityFilter,
  upsertBoardEntity,
  deepEqual,
  Button,
  BUTTONS,
  isEmptyObject,
  isValidJson,
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

  const isZone = boardObjectType === "zone";

  const normaliseFilter = (filter?: IFilter) => {
    if (!filter?.and_ || Object.keys(filter.and_).length === 0) {
      return undefined;
    }
    return filter;
  };

  // The fixed filter present on the component
  const getInitialFilter = () =>
    deepCopy(
      isZone
        ? zone.defaultFilter
        : zone.children?.[id]?.defaultFilter,
    );
  const [savedFilters, setSavedFilters] = useState(getInitialFilter);

  // The attributes currently selected for filtering on the component
  const [attributes, setAttributes] = useState<string[]>(
    Object.keys(savedFilters?.and_ || {})
  );

  // Only apply filter to the current component
  const getInitialPassThrough = () =>
    isZone ? false : zone.children?.[id]?.filterPassThrough || false;

  const [passThrough, setPassThrough] = useState<boolean>(getInitialPassThrough);
  const initialPassThroughRef = useRef<boolean>(getInitialPassThrough());

  // Ability to exclude incoming filters from the entity above
  const getInitialExcludeIncoming = () =>
    isZone
      ? zone.filterExcludeIncoming || false
      : zone.children?.[id]?.filterExcludeIncoming || false;

  const [excludeIncoming, setExcludeIncoming] = useState<boolean>(getInitialExcludeIncoming);
  const initialExcludeIncomingRef = useRef<boolean>(getInitialExcludeIncoming());

  // Toggle for if advanced translations are enabled
  const getIsAdvancedTranslations = () =>
    isZone ? !isEmptyObject(zone.translations) : false;
  const [isAdvancedTranslations, setIsAdvancedTranslations] = useState<boolean>(getIsAdvancedTranslations);
  const initialIsAdvancedTranslationsRef = useRef<boolean>(getIsAdvancedTranslations());

  // Local state for the translations text area
  const getInitialTranslationsText = () =>
    isZone && !isEmptyObject(zone.translations)
      ? JSON.stringify(zone.translations)
      : "";
  const [translationsText, setTranslationsText] = useState<string>(getInitialTranslationsText);
  const initialTranslationsTextRef = useRef<string>(getInitialTranslationsText());

  const getInitialCurrentFilterZone = (filter: IFilter | undefined) =>
    defineZoneWithComponentList(
      "dummy-object-for-remote-filters",
      [{ id: id, filter: deepCopy(filter) }]
    );

  // Local state for the filter zone if this is a zone level filter, otherwise use the passed zone/setZone
  const [currentFilterZone, setCurrentFilterZone] = useState<IZone>(
    getInitialCurrentFilterZone(savedFilters),
  );

  // Getting the disabled filter values (currently all other entity filters)
  const removeCurrentEntityFiltersForDisabledFilters = (
    source: object = {},
    remove?: object,
  ) => {
    const keysToRemove = new Set(Object.keys(remove || {}));
    return Object.fromEntries(
      Object.entries(source).filter(([key]) => !keysToRemove.has(key)),
    );
  };
  const [disabledFilterValues, setDisabledFilterValues] = useState(
    removeCurrentEntityFiltersForDisabledFilters(
      generateFilter(currentFilterZone, undefined, true)?.and_!,
      savedFilters?.and_!,
    ),
  );

  // Don't use `generateFilter` as it has a back-up of the defaultFilter
  const currentFilters = normaliseFilter(currentFilterZone.children?.[id]?.filter);
  const initialFiltersRef = useRef<IFilter | undefined>(normaliseFilter(getInitialFilter()));

  const hasPendingChanges = (
    !deepEqual(currentFilters, initialFiltersRef.current) ||
    passThrough !== initialPassThroughRef.current ||
    excludeIncoming !== initialExcludeIncomingRef.current ||
    isAdvancedTranslations !== initialIsAdvancedTranslationsRef.current ||
    translationsText !== initialTranslationsTextRef.current
  ) && (!isAdvancedTranslations || isValidJson(translationsText));

  useEffect(() => {
    if (!open) return;

    // Reset the state to the initial values when the drawer is opened
    const initialFilters = getInitialFilter();
    initialFiltersRef.current = normaliseFilter(initialFilters);
    setSavedFilters(initialFiltersRef.current);
    setAttributes(Object.keys(initialFilters?.and_ || {}));
    setDisabledFilterValues(
      removeCurrentEntityFiltersForDisabledFilters(
        generateFilter(zone, id, true)?.and_!,
        initialFilters?.and_!,
      ),
    );

    // Reset the toggles and text to their initial values
    initialPassThroughRef.current = getInitialPassThrough();
    setPassThrough(initialPassThroughRef.current);
    initialExcludeIncomingRef.current = getInitialExcludeIncoming();
    setExcludeIncoming(initialExcludeIncomingRef.current);
    initialIsAdvancedTranslationsRef.current = getIsAdvancedTranslations();
    setIsAdvancedTranslations(initialIsAdvancedTranslationsRef.current);
    initialTranslationsTextRef.current = getInitialTranslationsText();
    setTranslationsText(initialTranslationsTextRef.current);

    setCurrentFilterZone(getInitialCurrentFilterZone(initialFilters));
  }, [open]);

  const onSave = (filter: IFilter, passThrough: boolean, excludeIncoming: boolean) => {
    let attributes: IDBBoardEntityFilter = {
      filter: filter,
      filter_exclude_incoming: excludeIncoming,
    };
    if (isZone) {
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
      zone.filterExcludeIncoming = excludeIncoming;
      const parsedTranslations =
        isAdvancedTranslations && translationsText ? JSON.parse(translationsText) : undefined;
      zone.translations = parsedTranslations;
      // Cannot be undefined, so set to empty object if no translations are provided
      attributes.translations = parsedTranslations ? parsedTranslations : {};
    } else {
      zone.children[id].filter = deepCopy(filter);
      zone.children[id].defaultFilter = deepCopy(filter);
      zone.children[id].filterPassThrough = passThrough;
      zone.children[id].filterExcludeIncoming = excludeIncoming;
      attributes.filter_pass_through = passThrough;
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
      if (updatedZone.children?.[id]) {
        cleanFilterAttributesFromBoardEntity({
          boardEntity: updatedZone.children[id],
        });
      }
      return updatedZone;
    });
  };

  const removeFilter = (attribute: string) => {
    setAttributes((prev) => prev.filter((str) => str !== attribute));
    setCurrentFilterZone((prev) => {
      const updatedZone = deepCopy(prev);
      if (updatedZone.children?.[id]) {
        deleteFilterAttributeFromBoardEntity({
          attribute,
          boardEntity: updatedZone.children[id],
        });
      }
      return updatedZone;
    });
  };

  // Element to be passed to each remote filter to allow for individual removal of filters
  const RemoveCross = ({ attribute }: { attribute: string }) => (
    <Button {...BUTTONS.REMOVE} onClick={() => removeFilter(attribute)} />
  );

  const FilterPassThroughToggle = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-filter-pass-through-toggle"
        onClick={() => {
          setPassThrough(!passThrough);
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
    </div>
  )

  const ExcludeIncomingFiltersToggle = (
    <>
      <div className="tol-toggle-option">
        <Toggle
          key="tol-incoming-filters-toggle"
          onClick={() => {
            setExcludeIncoming(!excludeIncoming);
          }}
          checked={excludeIncoming}
        />
        <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
          Exclude incoming filters.
        </span>
        <IconTooltip
          contents={
            "Toggling this off means you will not use any incoming filters from the Zone above."
          }
        />
      </div>
      <div className="tol-toggle-option">
        {!excludeIncoming && isZone && (
          <>
            <Toggle
              key="tol-advanced-translations-toggle"
              onClick={() => {
                setIsAdvancedTranslations(!isAdvancedTranslations);
              }}
              checked={isAdvancedTranslations}
            />
            <span style={{ paddingRight: 6 }} onClick={(e) => e.stopPropagation()}>
              Use advanced Zone translations.
            </span>
            <IconTooltip
              contents={
                "Toggling this allows you to specify a mapping of custom translations. These are prioritised over automatic translations."
              }
            />
          </>
        )}
        {isAdvancedTranslations && (
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
    </>
  )

  return (
    <div>
      <Drawer
        title={`Filtering on a ${objectType} ${boardObjectType}`}
        open={open}
        setOpen={setOpen}
        onSave={() => onSave(currentFilters || { and_: {} }, passThrough, excludeIncoming)}
        hasPendingChanges={hasPendingChanges}
        onSaveTestId="apply-filter-button"
      >
        {ExcludeIncomingFiltersToggle}
        {!isZone && FilterPassThroughToggle}
        <hr style={{ marginTop: 24 }} />
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
              currentFilterZone.children?.[id]?.filter?.and_ || {},
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
          ExtraElement={RemoveCross}
          className={"tol-filter-config-remote-filter"}
          delay={0}
        />
      </Drawer>
    </div>
  );
}
