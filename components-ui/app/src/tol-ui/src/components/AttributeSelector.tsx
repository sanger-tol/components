/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckboxGroup } from "rsuite";
import { useEffect, useState } from "react";
import { IAttributeSelector } from "./interfaces";
import { TsDataSource, MultipleSelect, InfoTooltip } from "../index";
import { getSourceColour } from "../table/Utils";
import { normaliseCaps } from "../general/Utils";
import {
  getFlattenedMetaData,
  getDisplayName,
  getAttributeSources,
} from "./Utils";
import SourceTag from "./SourceTag";

function AttributeSelector(props: IAttributeSelector) {
  const {
    endpoint,
    baseUrl,
    disabledValues,
    placeholder,
    allowedTypes,
    attribute,
    setAttribute,
    tooltipContent,
    populatedFieldType = "value",
    additionalPopulatedFieldData,
    recommendedFilterAvailable,
    numPopulatedFields,
    sticky,
    renderSearchBySource,
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSources(getAttributeSources(entityMeta, endpoint));
  }, [entityMeta]);

  const searchBy = (keyword: string, label: any) => {
    const name = getDisplayName(entityMeta, endpoint, label).toLowerCase();
    const kw = keyword.toLowerCase();
    return name.includes(kw);
  };

  const menuItem = (displayName: string, source: string, key: string) => {
    const sourceColour = getSourceColour(source);
    const disabled =
      disabledValues && Object.keys(disabledValues).includes(key);
    const tooltipContents = tooltipContent || "disabled";
    return (
      <div key={key} style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flexGrow: 1 }}>
          {disabled ? (
            <span style={{ marginLeft: 3, marginRight: 6 }}>
              tooltipContent &&{" "}
              <InfoTooltip disableMarkdown contents={tooltipContents} />
            </span>
          ) : (
            <></>
          )}
          <div>
            <p style={{ marginTop: 0, marginBottom: 0 }}>{displayName}</p>
            <p
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: "12px",
                color: "grey",
              }}
            >
              {key}
            </p>
          </div>
        </div>
        {source && (
          <div
            className="customise-config-source"
            // @ts-ignore
            style={{
              "--config-source-bg-color": sourceColour,
              marginLeft: "auto",
            }}
          >
            {normaliseCaps(source)}
          </div>
        )}
      </div>
    );
  };

  const renderMenuItem = (l: any, index: number) => {
    const label = l.props?.children || l; // changes form in some instances!
    return (
      <div key={`${label}-${index}`}>
        {menuItem(
          getFlattenedMetaData(entityMeta, endpoint, label)["display_name"] ??
            normaliseCaps(label),
          getFlattenedMetaData(entityMeta, endpoint, label)["source"],
          label
        )}
      </div>
    );
  };

  const renderValue = (values: string[]) => {
    // This renders the total value of selected items
    return `
        ${values.length} ${
      values.length === 1 ? `${populatedFieldType}` : `${populatedFieldType}s`
    } selected${
      additionalPopulatedFieldData ||
      `; ${numPopulatedFields} ${
        numPopulatedFields === 1 ? "filter" : "filters"
      } populated.`
    }`;
  };

  const filterBySource = (source: string) => {
    if (source === "all") {
      setSelectedSources([]);
    } else if (source === "undefined") {
      setSelectedSources(["undefined"]);
    } else if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const searchBySource = () => {
    return (
      <div>
        <p
          style={{ marginTop: "10px", marginLeft: "5px", marginBottom: "5px" }}
        >
          Filter by source:
        </p>
        <div
          style={{
            display: "flex",
            paddingTop: "0px",
            flexWrap: "wrap",
            gap: "3px",
          }}
        >
          {sources.map((source, index) => (
            <div
              onClick={() => filterBySource(source)}
              key={index}
              style={{ marginTop: "5px", cursor: "pointer" }}
            >
              <SourceTag source={source} className={`${
                selectedSources.includes(source) ? "active" : ""
              }`}/>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <></>;

  return (
    <div className="tol-filters-selector">
      <MultipleSelect
        block
        noSelectAll
        data={Object.keys(getFlattenedMetaData(entityMeta, endpoint)).filter(
          (key) => {
            const meta = getFlattenedMetaData(entityMeta, endpoint)[key];
            const typeMatch =
              !allowedTypes || allowedTypes.includes(meta.python_type);
            const sourceMatch =
              selectedSources.length === 0 ||
              (selectedSources.includes("undefined")
                ? !sources.includes(meta.source)
                : selectedSources.includes(meta.source));
            return typeMatch && sourceMatch;
          }
        )}
        placeholder={placeholder}
        value={attribute}
        setValue={setAttribute}
        renderMenuItem={(l: any, index: number) => renderMenuItem(l, index)}
        renderValue={renderValue}
        disabledItemValues={disabledValues && [...Object.keys(disabledValues)]}
        searchBy={searchBy}
        sticky={sticky}
        renderExtraFooter={renderSearchBySource && searchBySource()}
      />
      {recommendedFilterAvailable && (
        <CheckboxGroup
          style={{ marginTop: "10px", marginBottom: "-20px" }}
          name="recommended-tick-filter"
          key="recommended-tick-filter"
        >
          {[
            <Checkbox
              onClick={() => {
                setRecommendedOn(!recommendedOn);
              }}
              checked={recommendedOn}
              key="recommended-tick-filter"
            >
              Tick to show only recommended properties.
            </Checkbox>,
          ]}
        </CheckboxGroup>
      )}
    </div>
  );
}

export default AttributeSelector;

//TODO: Allow search by source, add sources across the top?
//TODO: Add recommended filter tick button
//TODO: set limit on number of selections
//TODO: Add tooltip to what is recommended data
