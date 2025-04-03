/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox } from "rsuite";
import { useEffect, useState } from "react";
import {
  TsDataSource,
  MultipleSelect,
  InfoTooltip,
  Icon,
  PopUpMessage,
  SourceTag,
  EntityMetaToolTip,
} from "../index";
import {
  getFlattenedMetaData,
  getAttributeDetail,
  getAttributeSources,
  filterBySource,
  normaliseCaps,
} from "./utils";

interface AllowedCardinality {
  operator: string;
  value: number;
}

export interface Props {
  additionalPopulatedFieldData?: any;
  allowedTypes?: string[];
  attribute: string[];
  baseUrl?: string;
  disabledValues?: any;
  displaySource?: boolean;
  endpoint: string;
  maxSelections?: number;
  numPopulatedFields?: number;
  placeholder: string;
  populatedFieldType?: string;
  recommendedFilterAvailable?: boolean;
  renderSearchBySource?: boolean;
  setAttribute: (attribute: string[]) => void;
  setAllAttributeData?: (attributes: any) => void;
  onClean?: () => void;
  sticky?: boolean;
  tooltipContent?: string;
  customAttributeSelection?: string[];
  allowedCardinality?: AllowedCardinality;
}

function AttributeSelector(props: Props) {
  const {
    additionalPopulatedFieldData,
    allowedTypes,
    attribute,
    baseUrl,
    disabledValues,
    displaySource,
    endpoint,
    numPopulatedFields,
    maxSelections,
    placeholder,
    populatedFieldType = "value",
    recommendedFilterAvailable,
    renderSearchBySource,
    setAttribute,
    onClean,
    sticky,
    tooltipContent,
    customAttributeSelection,
    allowedCardinality,
    setAllAttributeData,
  } = props;

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});
  const [recommendedOn, setRecommendedOn] = useState<boolean>(false);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const ds = new TsDataSource({ baseUrl });

  useEffect(() => {
    ds.getEntityMeta()
      .then((em) => {
        setEntityMeta(em);
        setSources(getAttributeSources(em, endpoint, customAttributeSelection));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (setAllAttributeData && attribute.length > 0) {
      const initialAttributeData = getAllAttributeData(
        attribute,
        entityMeta,
        endpoint
      );
      setAllAttributeData(initialAttributeData);
    }
  }, [attribute, entityMeta, endpoint, setAllAttributeData]);

  const searchBy = (keyword: string, label: any) => {
    const name = getAttributeDetail(
      entityMeta,
      endpoint,
      label,
      "display_name"
    ).toLowerCase();
    const description = getAttributeDetail(
      entityMeta,
      endpoint,
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
                  baseUrl={baseUrl}
                  field={key}
                  endpoint={endpoint}
                />
              </span>
            )}
            <div className="tol-attribute-selector-display-key">
              {authoritative === true && <Icon icon="star" />}
              <p>{key}</p>
            </div>
          </div>
        </div>
        {displaySource && source && <SourceTag source={source} />}
      </div>
    );
  };

  const renderMenuItem = (l: any, index: number) => {
    const label = l.props?.children || l;
    const metaData = getFlattenedMetaData(entityMeta, endpoint, label);
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

  const renderTotalSelectedItems = (values: string[]) => {
    return `
        ${values.length} ${
          values.length === 1
            ? `${populatedFieldType}`
            : `${populatedFieldType}s`
        } selected${
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

  const getAllAttributeData = (
    attributes: string[],
    entityMeta: any,
    endpoint: string
  ) => {
    return attributes.reduce((acc, attr) => {
      const attributeData = getFlattenedMetaData(entityMeta, endpoint, attr);
      return {
        ...acc,
        [attr]: attributeData,
      };
    }, {});
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
    setAttribute(newAttribute);

    if (setAllAttributeData) {
      const allAttributeData = getAllAttributeData(
        newAttribute,
        entityMeta,
        endpoint
      );
      setAllAttributeData(allAttributeData);
    }
  };

  const filterAttributes = (
    entityMeta: any,
    endpoint: string,
    allowedTypes: string[] | undefined,
    selectedSources: string[],
    recommendedOn: boolean,
    allowedCardinality: AllowedCardinality | undefined,
    customAttributeSelection: string[] | undefined
  ) => {
    return Object.keys(getFlattenedMetaData(entityMeta, endpoint)).filter(
      (key) => {
        const meta = getFlattenedMetaData(entityMeta, endpoint)[key];
        const typeMatch =
          !allowedTypes || allowedTypes.includes(meta.python_type);
        const sourceMatch =
          selectedSources.length === 0 ||
          (selectedSources.includes("undefined")
            ? !meta.source || selectedSources.includes(meta.source)
            : selectedSources.includes(meta.source));
        const recommendedMatch = meta.authoritative === true;
        const cardinalityMatch =
          !allowedCardinality ||
          (meta.cardinality &&
            ((allowedCardinality.operator === ">" &&
              meta.cardinality > allowedCardinality.value) ||
              (allowedCardinality.operator === "<" &&
                meta.cardinality < allowedCardinality.value) ||
              (allowedCardinality.operator === "=" &&
                meta.cardinality === allowedCardinality.value) ||
              (allowedCardinality.operator === ">=" &&
                meta.cardinality >= allowedCardinality.value) ||
              (allowedCardinality.operator === "<=" &&
                meta.cardinality <= allowedCardinality.value)));

        return (
          (recommendedOn ? recommendedMatch : true) &&
          typeMatch &&
          sourceMatch &&
          cardinalityMatch &&
          (!customAttributeSelection || customAttributeSelection.includes(key))
        );
      }
    );
  };

  if (loading) return <></>;

  return (
    <div className="tol-attribute-selector">
      <MultipleSelect
        className="tol-attribute-selector-select"
        block
        noSelectAll
        data={filterAttributes(
          entityMeta,
          endpoint,
          allowedTypes,
          selectedSources,
          recommendedOn,
          allowedCardinality,
          customAttributeSelection
        ).sort((a, b) => {
          const metaA = getFlattenedMetaData(entityMeta, endpoint)[a];
          const metaB = getFlattenedMetaData(entityMeta, endpoint)[b];
          if (metaA.source === null || metaA.source === undefined) return 1;
          if (metaB.source === null || metaB.source === undefined) return -1;
          if (metaA.source < metaB.source) return -1;
          if (metaA.source > metaB.source) return 1;
          return a.localeCompare(b);
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

export default AttributeSelector;
