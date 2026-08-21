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
  ATTRIBUTE_TRANSLATIONS_PLACEHOLDER,
  RELATIONSHIP_TRANSLATION,
  ADVANCED_TRANSLATION,
  createEmptyFilter,
  normaliseCaps,
  TRANSLATOR_DISABLED_TEXT,
  Message,
} from ".."


export interface PFilterConfigDrawer extends IBoardTargetAndZone {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  aboveZone: IZone | null;
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
    aboveZone,
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

  const getInitialRelationshipTranslation = () => (
    isZone ? zone.relationshipTranslation ?? true : false
  );

  const getInitialAttributeTranslationsToggle = () => (
    isZone && !isEmptyObject(zone.attributeTranslations)
  );

  const getInitialAttributeTranslationsText = () => (
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
  const [relationshipTranslation, setRelationshipTranslation] = useState<boolean>(getInitialRelationshipTranslation);
  const [attributeTranslationsToggle, setAttributeTranslationsToggle] = useState<boolean>(getInitialAttributeTranslationsToggle);
  const [attributeTranslationsText, setAttributeTranslationsText] = useState<string>(getInitialAttributeTranslationsText);
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
  const initialRelationshipTranslationRef = useRef<boolean>(getInitialRelationshipTranslation());
  const initialAttributeTranslationsToggleRef = useRef<boolean>(getInitialAttributeTranslationsToggle());
  const initialAttributeTranslationsTextRef = useRef<string>(getInitialAttributeTranslationsText());
  // Don't use `generateFilter` as it has a back-up of the defaultFilter
  const currentFilters = normaliseFilter(currentFilterZone.children?.[id]?.filter);
  const initialFiltersRef = useRef<IFilter | undefined>(normaliseFilter(getInitialFilter()));

  const hasPendingChanges = (
    !deepEqual(currentFilters, initialFiltersRef.current) ||
    passThrough !== initialPassThroughRef.current ||
    excludeIncoming !== initialExcludeIncomingRef.current ||
    relationshipTranslation !== initialRelationshipTranslationRef.current ||
    attributeTranslationsToggle !== initialAttributeTranslationsToggleRef.current ||
    attributeTranslationsText !== initialAttributeTranslationsTextRef.current
  ) && (
      !attributeTranslationsToggle ||
      isValidJson(attributeTranslationsText)
    );

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
    initialRelationshipTranslationRef.current = getInitialRelationshipTranslation();
    setRelationshipTranslation(initialRelationshipTranslationRef.current);
    initialAttributeTranslationsToggleRef.current = getInitialAttributeTranslationsToggle();
    setAttributeTranslationsToggle(initialAttributeTranslationsToggleRef.current);
    initialAttributeTranslationsTextRef.current = getInitialAttributeTranslationsText();
    setAttributeTranslationsText(initialAttributeTranslationsTextRef.current);
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
      zone.relationshipTranslation = relationshipTranslation;
      const parsedAttributeTranslations =
        attributeTranslationsToggle && attributeTranslationsText
          ? JSON.parse(attributeTranslationsText)
          : undefined;
      zone.attributeTranslations = parsedAttributeTranslations;
      attributes.relationship_translation = relationshipTranslation;
      // Cannot be undefined, so set to empty object if no translations are provided
      attributes.attribute_translations = parsedAttributeTranslations ? parsedAttributeTranslations : {};
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

  const RelationshipTranslatorToggle = (
    <>
      <div className="tol-toggle-option">
        <Toggle
          key="tol-relationship-translations-toggle"
          onClick={() => {
            setRelationshipTranslation(!relationshipTranslation);
          }}
          checked={relationshipTranslation}
        />
        <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
          {RELATIONSHIP_TRANSLATION.LABEL}
        </span>
        <IconTooltip
          contents={RELATIONSHIP_TRANSLATION.TOOLTIP}
        />
      </div>
    </>
  )

  const AttributeTranslationsToggle = (
    <>
      <div className="tol-toggle-option">
        <Toggle
          key="tol-attribute-translations-toggle"
          onClick={() => {
            setAttributeTranslationsToggle(!attributeTranslationsToggle);
          }}
          checked={attributeTranslationsToggle}
        />
        <span className="tol-pr-sm" onClick={(e) => e.stopPropagation()}>
          {ADVANCED_TRANSLATION.LABEL}
        </span>
        <IconTooltip
          contents={ADVANCED_TRANSLATION.TOOLTIP}
        />
      </div>
      {attributeTranslationsToggle && (
        <div className="tol-ml-md">
          <div className="tol-mb-xs">Attribute Translations</div>
          <Input
            className="tol-mb-md"
            as="textarea"
            rows={attributeTranslationsText ? 4 : 1}
            placeholder={ATTRIBUTE_TRANSLATIONS_PLACEHOLDER}
            value={attributeTranslationsText}
            onChange={setAttributeTranslationsText}
          />
        </div>
      )}
    </>
  )

  const ExcludeIncomingFiltersToggle = (
    <div className="tol-toggle-option">
      <Toggle
        key="tol-incoming-filters-toggle"
        onClick={() => {
          setExcludeIncoming(!excludeIncoming);
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

  const showTranslationToggles = isZone && aboveZone && !excludeIncoming && !aboveZone.filterPassThrough;

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
        {showTranslationToggles ?
          <>
            {RelationshipTranslatorToggle}
            {AttributeTranslationsToggle}
            <hr />
          </>
          : isZone ?
            <div className="tol-mb-lg">
              <Message
                type="info"
                showIcon
                bordered
                header={false}
                closable={false}
                hidePrefix
              >
                {TRANSLATOR_DISABLED_TEXT}
              </Message>
            </div>
            : null
        }
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
