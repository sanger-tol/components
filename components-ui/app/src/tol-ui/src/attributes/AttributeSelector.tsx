/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Checkbox } from "rsuite";
import {
  AdvanceSearchTab,
  attributeSelectorSearchBy,
  filterAttributes,
  getAllAttributeData,
  getFlattenedMetaData,
  handleSetAttribute,
  IconTooltip,
  MenuItem,
  MultipleSelect,
  normaliseCaps,
  PROVENANCE_IN_FIELD_REGEX,
  PROVENANCE_IN_FIELD_REGEX_GLOBAL,
  renderTotalSelectedItems,
  SourceTag,
} from "..";
import type {
  IAllowedCardinality,
  IRemoteTarget,
} from "..";

export interface PAttributeSelector extends IRemoteTarget {
  additionalPopulatedFieldData?: any;
  allowedTypes?: string[];
  attribute: string[];
  disabledValues?: any;
  displaySource?: boolean;
  maxSelections?: number;
  numPopulatedFields?: number;
  placeholder?: string;
  populatedFieldType?: string;
  recommendedFilterAvailable?: boolean;
  renderSearchBySource?: boolean;
  setAttributes: (attributes: string[]) => void;
  setAttributeMeta?: (attributeMeta: any) => void;
  onClean?: () => void;
  sticky?: boolean;
  tooltipContent?: string;
  customAttributeSelection?: string[];
  allowedCardinality?: IAllowedCardinality;
  groupBy?: boolean;
  advanceTab?: boolean;
  testid?: string;
}

export function AttributeSelector(props: PAttributeSelector) {
  const {
    objectType,
    dataSource,
    additionalPopulatedFieldData,
    allowedTypes,
    attribute,
    disabledValues,
    displaySource,
    numPopulatedFields,
    maxSelections,
    populatedFieldType = "value",
    recommendedFilterAvailable,
    setAttributes,
    onClean,
    sticky,
    tooltipContent,
    customAttributeSelection,
    allowedCardinality,
    setAttributeMeta,
    groupBy,
    advanceTab,
    testid
  } = props;

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});
  const [recommendedOn, setRecommendedOn] = useState<boolean>(
    localStorage.getItem("attribute-selector-recommended-columns") === "true"
  );
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const placeholder = maxSelections && maxSelections === 1
    ? "Select an attribute"
    : props.placeholder || "Select attributes";

  useEffect(() => {
    dataSource
      .getEntityMeta()
      .then((em) => {
        setEntityMeta(em);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (setAttributeMeta && attribute.length > 0) {
      const initialAttributeData = getAllAttributeData(
        attribute,
        entityMeta,
        objectType
      );
      setAttributeMeta(initialAttributeData);
    }
  }, [attribute, entityMeta, objectType, setAttributeMeta]);

  const handleProvenanceChange = (field: string, selectedProvenance: string[]) => {
    // TODO: The format of what's to be added is not final yet.
    // Here is a placeholder (`${field}[${provenance}]`)
  
    // Remove existing provenance entries for this field
    const baseAttributes = attribute.filter(attr => !attr.startsWith(`${field}[`));
    
    // Add new provenance entries
    const provenanceAttributes = selectedProvenance.map(prov => `${field}[${prov}]`);
    
    // Update the attributes
    const newAttributes = [...baseAttributes, ...provenanceAttributes];
    setAttributes(newAttributes);
  };

  // TODO VERY PRELIMINARY
  const [provenances, setProvenances] = useState<Record<string, string[]>>({});
  // TODO HARDCODED FOR TESTING
  const provenancesAvailable: Record<string, string[]> = {
    "species.scientific_name": ["goat", "sts", "tolqc"],
    "grit_species.goat_scientific_name": ["goat", "sts", "tolqc"]
  };
  const RenderMenuItem = (l: any, index: number) => {
    const label = l.props?.children || l;
    const metaData = getFlattenedMetaData(entityMeta, objectType, label);
    return (
      <MenuItem
        key={`${label}-${index}`}
        source={metaData["source"]}
        field={label}
        authoritative={metaData["authoritative"]}
        objectType={objectType}
        dataSource={dataSource}
        displaySource={displaySource}
        tooltipContent={tooltipContent}
        disabledValues={disabledValues}
        provenancesAvailable={provenancesAvailable[label]}
        provenancesSelected={provenances[label]}
        onProvenancesChanged={(newProvenances) => {
          handleProvenanceChange(label, newProvenances);
          setProvenances({ ...provenances, [label]: newProvenances });
        }}
      />
    );
  };

  const RenderSelectedValue = (value: string) => {
    const metaData = getFlattenedMetaData(entityMeta, objectType, value) || {};
    const provenance = value.match(PROVENANCE_IN_FIELD_REGEX)?.[1];
    const displayName = metaData["display_name"]
      ?? (normaliseCaps(value) as string).replace(PROVENANCE_IN_FIELD_REGEX_GLOBAL, "");
    return (
      <span className="tol-attribute-selector-render-single-item">
        {displayName}
        <SourceTag source={provenance || metaData["source"]} />
      </span>
    );
  };

  const EXPAND_BUTTON_SELECTOR = "[data-testid^='attribute-selector-provenance-toggle-']";
  const OPEN_PROVENANCE_SELECTOR =
    ".tol-attribute-selector-menu-item[data-provenance-open='true']";
  const PROVENANCE_CHECKBOX_SELECTOR =
    ".tol-provenance-picker .tol-provenance-picker-checkbox input[type='checkbox']";

  const getNearestMenuItemContainer = (target: HTMLElement) => {
    // Prefer the local MenuItem container regardless of rsuite wrapper shape.
    const directMenuItem = target.closest<HTMLElement>(".tol-attribute-selector-menu-item");
    if (directMenuItem) return directMenuItem;

    // Fallback: when focus is on a row wrapper, locate the MenuItem rendered inside it.
    const rowContainer = target.closest<HTMLElement>(".rs-check-item, li, [role='option'], [role='menuitem']");
    return rowContainer?.querySelector<HTMLElement>(".tol-attribute-selector-menu-item") || null;
  };

  const getOpenProvenanceCheckboxesForMenuItem = (menuItem: HTMLElement) => {
    if (!menuItem.matches(OPEN_PROVENANCE_SELECTOR)) return [];

    return Array.from(
      menuItem.querySelectorAll<HTMLElement>(PROVENANCE_CHECKBOX_SELECTOR)
    );
  };

  /**
   * Runs when a keydown event is detected on the attribute selector,
   * which adds keyboard navigation to provenance dropdowns.
   * 
   * On a menu item, ArrowRight will focus the provenance toggle expand button.
   * Focus can be placed back on the menu item with ArrowLeft.
   * If this button is pressed to open the provenance picker, the entries in the provenance pickers
   * will be considered at the same level as the base menu items
   * (so they can all be cycled through with ArrowUp and ArrowDown).
   */
  const handleAttributeSelectorKeyNavigation = (
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    const attributeSelector = event.target as HTMLElement | null;
    if (!attributeSelector) return;

    // Keep native arrow-key behavior in the provenance picker
    // (otherwise RSCheckPicker will skip all its contents to go to the next menu item)
    if (attributeSelector.closest(".tol-provenance-picker")) return;

    // When the row has an expanded provenance list, ArrowUp/ArrowDown should enter
    // that sublist before moving to previous/next top-level rows of AttributeSelector
    // (handled by rsuite)
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      // Locate the provenance checkbox elements in this menu item's sublist
      const menuItem = getNearestMenuItemContainer(attributeSelector);
      if (!menuItem) return;
      const provenanceCheckboxes = getOpenProvenanceCheckboxesForMenuItem(menuItem);
      if (!provenanceCheckboxes.length) return;

      // If there are provenance entries in the sublist, enter it.
      // Further navigation up and down in this list is handled in MenuItem
      const targetCheckbox = event.key === "ArrowDown"
        ? provenanceCheckboxes[0] // Navigating down from above
        : provenanceCheckboxes[provenanceCheckboxes.length - 1]; // Navigating up from below

      // Override default behaviour
      event.preventDefault();
      event.stopPropagation();

      // Focus the provenance checkbox calculated above
      targetCheckbox.focus();
    } else if (event.key === "ArrowRight") {
      // Get the provenance expand button element
      const selectableContainer = attributeSelector.closest(".rs-check-item") || attributeSelector;
      const expandButton = selectableContainer.querySelector<HTMLButtonElement>(EXPAND_BUTTON_SELECTOR);
      if (!expandButton) return;

      // Focus it
      event.preventDefault();
      expandButton.focus();
    }
  };

  if (loading) return <></>;

  return (
    <div
      className="tol-attribute-selector"
      data-testid={testid}
      // Register the event at the capture phase so it overrides the default menu navigation
      onKeyDownCapture={handleAttributeSelectorKeyNavigation}
    >
      <MultipleSelect
        className="tol-attribute-selector-select"
        menuClassName={`tol-attribute-selector-menu${maxSelections === 1 && ' tol-single-selector'}`}
        block
        noSelectAll
        groupBy={groupBy ? "relationship_name" : undefined}
        data={filterAttributes(
          entityMeta,
          objectType,
          allowedTypes,
          selectedSources,
          recommendedOn,
          allowedCardinality,
          customAttributeSelection
        ).sort((a, b) => {
          if (a.source === null || a.source === undefined) return 1;
          if (b.source === null || b.source === undefined) return -1;
          if (a.source < b.source) return -1;
          if (a.source > b.source) return 1;
          return a.label.localeCompare(b.label);
        })}
        placeholder={placeholder}
        value={attribute}
        setValue={(newAttribute: string[]) => {
          handleSetAttribute(
            newAttribute,
            maxSelections!,
            setAttributes,
            entityMeta,
            objectType,
            setAttributeMeta
          );
        }}
        renderMenuItem={(l: any, index: number) => RenderMenuItem(l, index)}
        renderMenu={
          advanceTab
            ? (menuItem) =>
              <AdvanceSearchTab
                MenuItem={menuItem}
                dataSource={dataSource}
                objectType={objectType}
                setAttributes={setAttributes}
              />
            : undefined
        }
        renderValue={(values: string[]) => {
          return renderTotalSelectedItems(
            values,
            RenderSelectedValue,
            populatedFieldType,
            additionalPopulatedFieldData,
            numPopulatedFields
          );
        }}
        disabledItemValues={disabledValues && [...Object.keys(disabledValues)]}
        searchBy={(keyWord: string, label: string) => {
          return attributeSelectorSearchBy(keyWord, label, entityMeta, objectType);
        }}
        sticky={sticky}
        // TODO here
        onClean={() => {onClean?.(); setProvenances({});}}
        onClose={() => setSelectedSources([])}
      />
      {recommendedFilterAvailable && (
        <div className="tol-attribute-selector-suggested-toggle">
          <Checkbox
            key="recommended-tick-filter"
            onChange={() => {
              setRecommendedOn(!recommendedOn);
              localStorage.setItem(
                "attribute-selector-recommended-columns",
                String(!recommendedOn)
              );
            }}
            checked={recommendedOn}
          />
          <span
            style={{ paddingRight: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            Recommended columns.
          </span>
          <IconTooltip
            contents={"Recommended properties are indicated by a star icon."}
          />
        </div>
      )}
    </div>
  );
}
