/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Animation as RSAnimation, Checkbox as RSCheckbox } from "rsuite";

import {
  AttributeTitle,
  Button,
  Col,
  Icon,
  SourceTag,
  truncateString,
  TsDataSource,
} from "..";

export interface PMenuItem {
  source: string;
  field: string;
  authoritative: boolean;
  objectType: string;
  dataSource: TsDataSource;
  displaySource?: boolean;
  tooltipContent?: string;
  disabledValues?: any;
  provenancesAvailable?: string[];
  provenancesSelected?: string[];
  onProvenancesChanged?: (newProvenances: string[]) => void
}

export function MenuItem(props: PMenuItem) {
  const {
    source,
    field,
    authoritative,
    disabledValues,
    objectType,
    dataSource,
    displaySource,
    provenancesAvailable = [],
    provenancesSelected = [],
    onProvenancesChanged,
  } = props;

  const [provenancePickerOpen, setProvenancePickerOpen] = useState(false);

  const disabled =
    disabledValues && Object.keys(disabledValues).includes(field);

  const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  // The contents of the main item entry showing the non-provenance field
  const MenuItemAttributeTitle = (
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
  );

  // The contents of the expanded area when the expand button on the right of the menu item
  // is clicked. Contains an option for each available provenance
  const ProvenancePicker = forwardRef<
    HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => (
    <div {...props} ref={ref} onClick={e => e.stopPropagation()}>
      <div className="tol-provenance-picker" role="listbox">
        {provenancesAvailable.map(provenance =>
          <span
            key={provenance}
            className="tol-provenance-picker-entry"
            role="option"
          >
            <RSCheckbox
              className="tol-provenance-picker-checkbox"
              checked={provenancesSelected.includes(provenance)}
              onChange={(_value, checked) => onProvenancesChanged?.(
                checked
                  ? [...provenancesSelected, provenance]
                  : provenancesSelected.filter(item => item !== provenance)
              )}
            >
              <SourceTag
                source={provenance}
              />
            </RSCheckbox>
          </span>
        )}
      </div>
    </div>
  ));

  return (
    <Col className="tol-attribute-selector-menu-item">
      <div key={field} className="tol-attribute-selector-menu-item-container">
        {MenuItemAttributeTitle}
        <span className="tol-attribute-selector-menu-item-right-container">
          {displaySource && source && <SourceTag source={source} />}
          {provenancesAvailable.length > 0 && (
            <Button
              outline
              icon={provenancePickerOpen ? "angle-up" : "angle-down"}
              tooltip="Configure Provenance"
              onClick={() => setProvenancePickerOpen(prev => !prev)}
            />
          )}
        </span>
      </div>
      <RSAnimation.Collapse in={provenancePickerOpen}>
        {(props, ref) => <ProvenancePicker {...props} ref={ref} />}
      </RSAnimation.Collapse>
    </Col>
  );
}
