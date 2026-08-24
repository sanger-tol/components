/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  TsDataSource,
  Icon,
  SourceTag,
  truncateString,
  AttributeTitle
} from "..";

export interface PMenuItem {
  source: string,
  field: string,
  authoritative: boolean,
  objectType: string,
  dataSource: TsDataSource,
  tooltipContent?: string,
  disabledValues?: any,
}

export function MenuItem(props: PMenuItem) {
  const { source, field, authoritative, disabledValues,
    objectType, dataSource } = props;

  const disabled =
    disabledValues && Object.keys(disabledValues).includes(field);

  const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  return (
    <div key={field} className="tol-attribute-selector-menu-item-container">
      <div className="tol-attribute-selector-menu-item-inner-container">
        <div className="tol-attribute-selector-display-name">
          <AttributeTitle
            objectType={objectType}
            dataSource={dataSource}
            attributeId={field}
            className={disabled ? "disabled" : undefined}
          />
          <div className="tol-attribute-selector-display-key">
            {authoritative === true && <Icon icon="star" />}
            <p>{truncateString(field, lettersToDisplay)}</p>
          </div>
        </div>
      </div>
      {source && <SourceTag source={source} />}
    </div>
  );
}