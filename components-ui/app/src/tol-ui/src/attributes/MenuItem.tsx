/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  IconTooltip,
  AttributeTooltip,
  TsDataSource,
  Icon,
  SourceTag,
  truncateString
} from "..";

export interface PMenuItem {
  displayName: string,
  source: string,
  field: string,
  authoritative: boolean,
  objectType: string,
  dataSource: TsDataSource,
  displaySource?: boolean,
  tooltipContent?: string,
  disabledValues?: any,
}

export function MenuItem(props: PMenuItem) {
  const { displayName, source, field, authoritative, disabledValues,
    tooltipContent, objectType, dataSource, displaySource } = props;

  const disabled =
    disabledValues && Object.keys(disabledValues).includes(field);
  const tooltipContents = tooltipContent || "disabled";

  const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  return (
    <div key={field} className="tol-attribute-selector-menu-item-container">
      <div className="tol-attribute-selector-menu-item-inner-container">
        <div className="tol-attribute-selector-display-name">
          {displayName}{" "}
          {disabled ? (
            <span className="tol-attribute-selector-tooltip">
              {tooltipContent && (
                <IconTooltip disableMarkdown contents={tooltipContents} />
              )}
            </span>
          ) : (
            <span className="tol-attribute-selector-tooltip">
              <AttributeTooltip
                field={field}
                objectType={objectType}
                dataSource={dataSource}
              />
            </span>
          )}
          <div className="tol-attribute-selector-display-key">
            {authoritative === true && <Icon icon="star" />}
            <p>{truncateString(field, lettersToDisplay)}</p>
          </div>
        </div>
      </div>
      {displaySource && source && <SourceTag source={source} />}
    </div>
  );
}