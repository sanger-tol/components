/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox } from "rsuite";
import { useEffect, useState } from "react";
import { IAttributeSelector } from "./interfaces";
import { TsDataSource, MultipleSelect, InfoTooltip } from "../index";
import { getSourceColour } from "../table/Utils";
import { normaliseCaps } from "../general/Utils";
import { getFlattenedMetaData, getDisplayName } from "./Utils";

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
    authoratatativeFilterAvailable,
  } = props;
  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});
  const [authoratativeOn, setAuthoratativeOn] = useState<boolean>(false);

  const ds = new TsDataSource({ baseUrl });

  useEffect(() => {
    ds.getEntityMeta().then((em) => {
      setEntityMeta(em);
      props.setEntityMeta && props.setEntityMeta(em); //TODO: umm what?
      setLoading(false);
    });
  }, []);

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

  const renderMenuItem = (l: any) => {
    const label = l.props?.children || l; // changes form in some instances!
    return (
      <div>
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
    const numPopulatedFilter = values.length || 0;
    return `
        ${values.length} ${
      values.length === 1 ? `${populatedFieldType}` : `${populatedFieldType}s`
    } selected${
      additionalPopulatedFieldData ||
      `; ${numPopulatedFilter} ${
        numPopulatedFilter === 1 ? "filter" : "filters"
      } populated.`
    }`;
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
            return !allowedTypes || allowedTypes.includes(meta.python_type);
          }
        )}
        placeholder={placeholder}
        value={attribute}
        setValue={setAttribute}
        renderMenuItem={renderMenuItem}
        renderValue={renderValue}
        disabledItemValues={disabledValues && [...Object.keys(disabledValues)]}
        searchBy={searchBy}
      />
      {authoratatativeFilterAvailable && (
        <div
          style={{ marginTop: "10px", marginBottom: "-20px" }}
        >
          <Checkbox
            onClick={() => {
              setAuthoratativeOn(!authoratativeOn);
            }}
            checked={authoratativeOn}
          >
            Tick to show only authoratative properties
          </Checkbox>
        </div>
      )}
    </div>
  );
}

export default AttributeSelector;

//TODO: Allow search by source, add sources across the top?
//TODO: Add authoratative filter tick button
//TODO: set limit on number of selections
//TODO: Add tooltip to what is authoratative data
