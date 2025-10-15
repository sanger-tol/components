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
  getAttributeSources,
  normaliseCaps,
  filterAttributes,
  getAllAttributeData,
  IRemoteTarget,
  IAllowedCardinality,
  handleSetAttribute,
  SourceContainer,
  renderTotalSelectedItems,
  MenuItem,
  AttributeTooltip,
  Icon,
  truncateString
} from "..";

export interface PAttributeSelector extends IRemoteTarget {
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
  allowedCardinality?: IAllowedCardinality;
  groupBy?: boolean;
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
  const [recommendedOn, setRecommendedOn] = useState<boolean>(
    localStorage.getItem("attribute-selector-recommended-columns") === "true"
  );
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  useEffect(() => {
    dataSource
      .getEntityMeta()
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

  const RenderMenuItem = (l: any, index: number) => {
    const label = l.props?.children || l;
    const metaData = getFlattenedMetaData(entityMeta, objectType, label);
    return (
      <div key={`${label}-${index}`}>
        <MenuItem
          displayName={metaData["display_name"] ?? normaliseCaps(label)}
          source={metaData["source"]}
          field={label}
          authoritative={metaData["authoritative"]}
          objectType={objectType}
          dataSource={dataSource}
          displaySource={displaySource}
          tooltipContent={tooltipContent}
          disabledValues={disabledValues}
        />

      </div>
    );
  };

  // const MenuItem = (
  //   displayName: string,
  //   source: string,
  //   key: string,
  //   authoritative: boolean
  // ) => {
  //   const disabled =
  //     disabledValues && Object.keys(disabledValues).includes(key);
  //   const tooltipContents = tooltipContent || "disabled";

  //   const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  //   return (
  //     <div key={key} className="tol-attribute-selector-menu-item-container">
  //       <div className="tol-attribute-selector-menu-item-inner-container">
  //         <div className="tol-attribute-selector-display-name">
  //           {displayName}{" "}
  //           {disabled ? (
  //             <span className="tol-attribute-selector-tooltip">
  //               {tooltipContent && (
  //                 <IconTooltip disableMarkdown contents={tooltipContents} />
  //               )}
  //             </span>
  //           ) : (
  //             <span className="tol-attribute-selector-tooltip">
  //               <AttributeTooltip
  //                 field={key}
  //                 objectType={objectType}
  //                 dataSource={dataSource}
  //               />
  //             </span>
  //           )}
  //           <div className="tol-attribute-selector-display-key">
  //             {authoritative === true && <Icon icon="star" />}
  //             <p>{truncateString(key, lettersToDisplay)}</p>
  //           </div>
  //         </div>
  //       </div>
  //       {displaySource && source && <SourceTag source={source} />}
  //     </div>
  //   )
  // }

  const RenderSelectedValue = (value: string) => {
    const metaData = getFlattenedMetaData(entityMeta, objectType, value);
    return (
      <span className="tol-attribute-selector-render-single-item">
        {metaData["display_name"] ?? normaliseCaps(value)}
        <SourceTag source={metaData["source"]} />
      </span>
    );
  };

  if (loading) return <></>;

  return (
    <div className="tol-attribute-selector">
      <MultipleSelect
        className="tol-attribute-selector-select"
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
        renderExtraFooter={renderSearchBySource &&
          <SourceContainer
            sources={sources}
            selectedSources={selectedSources}
            setSelectedSources={setSelectedSources}
          />
        }
        onClean={onClean}
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
