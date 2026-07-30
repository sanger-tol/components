/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Checkbox } from "rsuite";
import {
  MultipleSelect,
  IconTooltip,
  SourceTag,
  getFlattenedMetaData,
  attributeSelectorSearchBy,
  normaliseCaps,
  filterAttributes,
  getAllAttributeData,
  IRemoteTarget,
  IAllowedCardinality,
  handleSetAttribute,
  renderTotalSelectedItems,
  MenuItem,
  AdvanceSearchTab,
  PROVENANCE_IN_FIELD_REGEX,
  PROVENANCE_IN_FIELD_REGEX_GLOBAL,
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
    "grit_species.goat_genus": ["goat", "sts"],
    "grit_species.goat_scientific_name": ["goat", "sts"],
    "grit_species.goat_common_name": ["goat", "sts"],
    "grit_tolid.tolqc_sts_specimen": ["sts", "benchling", "grit"]
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
    const provenance = value.match(PROVENANCE_IN_FIELD_REGEX)?.[1]
    const displayName = metaData["display_name"]
      ?? (normaliseCaps(value) as string).replace(PROVENANCE_IN_FIELD_REGEX_GLOBAL, "");
    return (
      <span className="tol-attribute-selector-render-single-item">
        {displayName}
        <SourceTag source={provenance || metaData["source"]} />
      </span>
    );
  };

  if (loading) return <></>;

  return (
    <div className="tol-attribute-selector" data-testid={testid}>
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
