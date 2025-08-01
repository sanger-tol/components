/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Checkbox } from "rsuite";
import {
  MultipleSelect,
  InfoTooltip,
  Icon,
  PopUpMessage,
  SourceTag,
  EntityMetaToolTip,
  getFlattenedMetaData,
  getAttributeDetail,
  getAttributeSources,
  filterBySource,
  normaliseCaps,
  filterAttributes,
  getAllAttributeData,
  truncateString,
  IRemoteTarget,
  AllowedCardinality
} from "..";

interface Props extends IRemoteTarget{
  additionalPopulatedFieldData?: any;
  allowedTypes?: string[];
  attribute: string[];
  disabledValues?: any;
  displaySource?: boolean;
  maxSelections?: number;
  numPopulatedFields?: number;
  placeholder: string;
  populatedFieldType?: string;
  recommendedFilterAvailable?: boolean;
  renderSearchBySource?: boolean;
  setAttributes: (attributes: string[]) => void;
  setAttributeMeta?: (attributeMeta: any) => void;
  onClean?: () => void;
  sticky?: boolean;
  tooltipContent?: string;
  customAttributeSelection?: string[];
  allowedCardinality?: AllowedCardinality;
  groupBy?: boolean;
}

export function AttributeSelector(props: Props) {
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
    placeholder,
    populatedFieldType = "value",
    recommendedFilterAvailable,
    renderSearchBySource,
    setAttributes,
    onClean,
    sticky,
    tooltipContent,
    customAttributeSelection,
    allowedCardinality,
    setAttributeMeta,
    groupBy,
  } = props;

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});
  const [recommendedOn, setRecommendedOn] = useState<boolean>(false);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  useEffect(() => {
    dataSource.getEntityMeta()
      .then((em) => {
        setEntityMeta(em);
        setSources(
          getAttributeSources(em, objectType, customAttributeSelection)
        );
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

  const searchBy = (keyword: string, label: any) => {
    const name = getAttributeDetail(
      entityMeta,
      objectType,
      label,
      "display_name"
    ).toLowerCase();
    const description = getAttributeDetail(
      entityMeta,
      objectType,
      label,
      "description"
    ).toLowerCase();
    const kw = keyword.toLowerCase();

    return name.includes(kw) || label.includes(kw) || description.includes(kw);
  };

  const menuItem = (
    displayName: string,
    source: string,
    key: string,
    authoritative: boolean
  ) => {
    const disabled =
      disabledValues && Object.keys(disabledValues).includes(key);
    const tooltipContents = tooltipContent || "disabled";

    const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

    return (
      <div key={key} className="tol-attribute-selector-menu-item-container">
        <div className="tol-attribute-selector-menu-item-inner-container">
          <div className="tol-attribute-selector-display-name">
            {displayName}{" "}
            {disabled ? (
              <span className="tol-attribute-selector-tooltip">
                {tooltipContent && (
                  <InfoTooltip disableMarkdown contents={tooltipContents} />
                )}
              </span>
            ) : (
              <span className="tol-attribute-selector-tooltip">
                <EntityMetaToolTip
                  field={key}
                  objectType={objectType}
                  dataSource={dataSource}
                />
              </span>
            )}
            <div className="tol-attribute-selector-display-key">
              {authoritative === true && <Icon icon="star" />}
              <p>{truncateString(key, lettersToDisplay)}</p>
            </div>
          </div>
        </div>
        {displaySource && source && <SourceTag source={source} />}
      </div>
    );
  };

  const renderMenuItem = (l: any, index: number) => {
    const label = l.props?.children || l;
    const metaData = getFlattenedMetaData(entityMeta, objectType, label);
    return (
      <div key={`${label}-${index}`}>
        {menuItem(
          metaData["display_name"] ?? normaliseCaps(label),
          metaData["source"],
          label,
          metaData["authoritative"]
        )}
      </div>
    );
  };

  const renderSelectedValue = (value: string) => {
    const metaData = getFlattenedMetaData(entityMeta, objectType, value);
    return (
    <span className="tol-attribute-selector-render-single-item">
      {metaData["display_name"] ?? normaliseCaps(value)} 
      <SourceTag source={metaData["source"]}/>
    </span>
    );
  };

  const renderTotalSelectedItems = (values: string[]) => {
    if (values.length === 1) {
      return renderSelectedValue(values[0]);
    }
    return `${values.length} ${populatedFieldType}s selected${
      additionalPopulatedFieldData ||
      `; ${numPopulatedFields} ${
        numPopulatedFields === 1 ? "filter" : "filters"
      } populated.`
    }`;
  };

  const searchBySource = () => {
    const hasActiveSource = selectedSources.length > 0;

    return (
      <div className="tol-attribute-selector-search-by-source-container">
        <p>Filter by source:</p>
        <div className="tol-attribute-selector-sources">
          {sources.map((source: string, index: number) => (
            <div
              key={index}
              className="tol-attribute-selector-sources-inner-container"
              onClick={() =>
                filterBySource(source, selectedSources, setSelectedSources)
              }
            >
              <SourceTag
                source={source}
                className={`${
                  selectedSources.includes(source) ? "active" : ""
                } ${
                  hasActiveSource && !selectedSources.includes(source)
                    ? "faded"
                    : ""
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSetAttribute = (newAttribute: string[]) => {
    if (maxSelections) {
      if (newAttribute.length > maxSelections) {
        PopUpMessage({
          type: "warning",
          message: `You can select a maximum number of ${maxSelections} items.`,
        });
        return;
      }
    }
    setAttributes(newAttribute);

    if (setAttributeMeta) {
      const allAttributeData = getAllAttributeData(
        newAttribute,
        entityMeta,
        objectType
      );
      setAttributeMeta(allAttributeData);
    }
  };

  if (loading) return <></>;

  return (
    <div className="tol-attribute-selector">
      <MultipleSelect
        className="tol-attribute-selector-select"
        block
        noSelectAll
        groupBy={groupBy ? 'relationship_name' : undefined}
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
        setValue={handleSetAttribute}
        renderMenuItem={(l: any, index: number) => renderMenuItem(l, index)}
        renderValue={renderTotalSelectedItems}
        disabledItemValues={disabledValues && [...Object.keys(disabledValues)]}
        searchBy={searchBy}
        sticky={sticky}
        renderExtraFooter={renderSearchBySource && searchBySource()}
        onClean={onClean}
        onClose={() => setSelectedSources([])}
      />
      {recommendedFilterAvailable && (
        <div className="tol-attribute-selector-suggested-toggle">
          <Checkbox
            key="recommended-tick-filter"
            onChange={() => {
              setRecommendedOn(!recommendedOn);
            }}
            checked={recommendedOn}
          />
          <span
            style={{ paddingRight: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            Recommended columns.
          </span>
          <InfoTooltip
            contents={"Recommended properties are indicated by a star icon."}
          />
        </div>
      )}
    </div>
  );
}
