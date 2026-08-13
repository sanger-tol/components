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
  BOARD_ENTITIES,
  FILTER_PASS_THROUGH,
  FILTER_EXCLUDE_INCOMING,
  AUTO_TRANSLATION,
  ADVANCED_TRANSLATION,
  createEmptyFilter,
  normaliseCaps,
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

  const isZone = boardObjectType === BOARD_ENTITIES.ENTITIES.ZONE;

  const normaliseFilter = (filter?: IFilter) => {
    if (!filter?.and_ || Object.keys(filter.and_).length === 0) {
      return undefined;
    }
    return filter;
  };

  // Initializers
  const getInitialFilter = () => (
    deepCopy(
      isZone
        ? zone.defaultFilter
        : zone.children?.[id]?.defaultFilter,
    )
  );
  const getInitialPassThrough = () => (
    isZone
      ? zone.filterPassThrough || false
      : zone.children?.[id]?.filterPassThrough || false
  );
  const getInitialExcludeIncoming = () => (
    isZone
      ? zone.filterExcludeIncoming || false
      : zone.children?.[id]?.filterExcludeIncoming || false
  );
  const getInitialAutoTranslations = () => (
    isZone ? zone.autoTranslations ?? true : false
  );
  const getIsAdvancedTranslations = () => (
    isZone ? !isEmptyObject(zone.attributeTranslations) : false
  );
  const getInitialTranslationsText = () => (
    isZone && !isEmptyObject(zone.attributeTranslations)
      ? JSON.stringify(zone.attributeTranslations)
      : ""
  );
  const getInitialCurrentFilterZone = (filter: IFilter | undefined) => (
    defineZoneWithComponentList(
      "dummy-object-for-remote-filters",
      [{ id: id, filter: deepCopy(filter) }]
    )
  );
  const removeCurrentEntityFiltersForDisabledFilters = (
    source: object = {},
    remove?: object,
  ) => {
    const keysToRemove = new Set(Object.keys(remove || {}));
    return Object.fromEntries(
      Object.entries(source).filter(([key]) => !keysToRemove.has(key)),
    );
  };

  // State
  const [savedFilters, setSavedFilters] = useState(getInitialFilter);
  const [attributes, setAttributes] = useState<string[]>(
    Object.keys(savedFilters?.and_ || {})
  );
  const [passThrough, setPassThrough] = useState<boolean>(getInitialPassThrough);
  const [excludeIncoming, setExcludeIncoming] = useState<boolean>(getInitialExcludeIncoming);
  const [autoTranslations, setAutoTranslations] = useState<boolean>(getInitialAutoTranslations);
  const [isAdvancedTranslations, setIsAdvancedTranslations] = useState<boolean>(getIsAdvancedTranslations);
  const [translationsText, setTranslationsText] = useState<string>(getInitialTranslationsText);
  const [currentFilterZone, setCurrentFilterZone] = useState<IZone>(
    getInitialCurrentFilterZone(savedFilters),
  );
  const [disabledFilterValues, setDisabledFilterValues] = useState(
    removeCurrentEntityFiltersForDisabledFilters(
      generateFilter(currentFilterZone, undefined, true)?.and_!,
      savedFilters?.and_!,
    ),
  );

  // Refs
  const initialPassThroughRef = useRef<boolean>(getInitialPassThrough());
  const initialExcludeIncomingRef = useRef<boolean>(getInitialExcludeIncoming());
  const initialAutoTranslationsRef = useRef<boolean>(getInitialAutoTranslations());
  const initialIsAdvancedTranslationsRef = useRef<boolean>(getIsAdvancedTranslations());
  const initialTranslationsTextRef = useRef<string>(getInitialTranslationsText());
  // Don't use `generateFilter` as it has a back-up of the defaultFilter
  const currentFilters = normaliseFilter(currentFilterZone.children?.[id]?.filter);
  const initialFiltersRef = useRef<IFilter | undefined>(normaliseFilter(getInitialFilter()));

  const hasPendingChanges = (
    !deepEqual(currentFilters, initialFiltersRef.current) ||
    passThrough !== initialPassThroughRef.current ||
    excludeIncoming !== initialExcludeIncomingRef.current ||
    autoTranslations !== initialAutoTranslationsRef.current ||
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
    initialAutoTranslationsRef.current = getInitialAutoTranslations();
    setAutoTranslations(initialAutoTranslationsRef.current);
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
      filter_pass_through: passThrough,
    };
    if (isZone) {
      zone.filter = deepCopy(filter);
      zone.defaultFilter = deepCopy(filter);
      zone.filterExcludeIncoming = excludeIncoming;
      zone.filterPassThrough = passThrough;
      zone.autoTranslations = autoTranslations;
      const parsedTranslations =
        isAdvancedTranslations && translationsText ? JSON.parse(translationsText) : undefined;
      zone.attributeTranslations = parsedTranslations;
      attributes.auto_translations = autoTranslations;
      // Cannot be undefined, so set to empty object if no translations are provided
      attributes.attribute_translations = parsedTranslations ? parsedTranslations : {};
    } else {
      zone.children[id].filter = deepCopy(filter);
      zone.children[id].defaultFilter = deepCopy(filter);
      zone.children[id].filterPassThrough = passThrough;
      zone.children[id].filterExcludeIncoming = excludeIncoming;
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

  const AutoTranslators = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-auto-translations-toggle"
        onClick={() => {
          setAutoTranslations(!autoTranslations);
        }}
        checked={autoTranslations}
      />
      <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
        {AUTO_TRANSLATION.LABEL}
      </span>
      <IconTooltip
        contents={AUTO_TRANSLATION.TOOLTIP}
      />
    </div>
  )

  const AdvancedTranslators = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-advanced-translations-toggle"
        onClick={() => {
          setIsAdvancedTranslations(!isAdvancedTranslations);
        }}
        checked={isAdvancedTranslations}
      />
      <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
        {ADVANCED_TRANSLATION.LABEL}
      </span>
      <IconTooltip
        contents={ADVANCED_TRANSLATION.TOOLTIP}
      />
      {isAdvancedTranslations && (
        <Input
          className="tol-filter-translations-input"
          as="textarea"
          rows={translationsText ? 6 : 1}
          placeholder={`{"above_zone_field_id": "current_zone_field_id"}`}
          value={translationsText}
          onChange={setTranslationsText}
        />
      )}
    </div>
  )

  const ExcludeIncomingFiltersToggle = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-incoming-filters-toggle"
        onClick={() => {
          setExcludeIncoming(!excludeIncoming);
          setAutoTranslations(false);
          setIsAdvancedTranslations(false);
        }}
        checked={excludeIncoming}
      />
      <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
        {isZone
          ? FILTER_EXCLUDE_INCOMING.LABEL_ZONE
          : FILTER_EXCLUDE_INCOMING.LABEL_COMPONENT}
      </span>
      <IconTooltip
        contents={
          isZone
            ? FILTER_EXCLUDE_INCOMING.TOOLTIP_ZONE
            : FILTER_EXCLUDE_INCOMING.TOOLTIP_COMPONENT
        }
      />
    </div>
  )

  const FilterPassThroughToggle = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-filter-pass-through-toggle"
        onClick={() => {
          setPassThrough(!passThrough);
        }}
        checked={passThrough}
      />
      <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
        {FILTER_PASS_THROUGH.LABEL(normaliseCaps(boardObjectType))}
      </span>
      <IconTooltip
        contents={
          FILTER_PASS_THROUGH.TOOLTIP
        }
      />
    </div>
  )

  const showTranslationToggles = isZone && !excludeIncoming;

  return (
    <div className="tol-filter-config-drawer">
      <Drawer
        title={`Filtering on a ${normaliseCaps(objectType)} ${normaliseCaps(boardObjectType)}`}
        open={open}
        setOpen={setOpen}
        onSave={() => onSave(currentFilters || createEmptyFilter(), passThrough, excludeIncoming)}
        hasPendingChanges={hasPendingChanges}
        onSaveTestId="apply-filter-button"
      >
        {showTranslationToggles && AutoTranslators}
        {showTranslationToggles && AdvancedTranslators}
        {isZone && <hr />}
        {ExcludeIncomingFiltersToggle}
        {FilterPassThroughToggle}
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
