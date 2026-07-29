/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Animation as RSAnimation, Checkbox as RSCheckbox } from "rsuite";

import {
  TsDataSource,
  Icon,
  SourceTag,
  truncateString,
  AttributeTitle,
  Button,
  Col,
} from "..";

export interface PMenuItem {
  source: string,
  field: string,
  authoritative: boolean,
  objectType: string,
  dataSource: TsDataSource,
  displaySource?: boolean,
  tooltipContent?: string,
  disabledValues?: any,
  provenances?: string[];
  onProvenanceChange?: (field: string, selectedProvenance: string[]) => void;
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
    provenances,
    onProvenanceChange
  } = props;

  const [provenancePickerOpen, setProvenancePickerOpen] = useState(false);
  const [selectedProvenance, setSelectedProvenance] = useState<string[]>([]);

  const handleProvenanceChange = (item: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedProvenance, item]
      : selectedProvenance.filter(p => p !== item);
    setSelectedProvenance(updated);
    onProvenanceChange?.(field, updated);
  };

  const disabled =
    disabledValues && Object.keys(disabledValues).includes(field);

  const lettersToDisplay = window.innerWidth < 576 ? 30 : 60;

  const ItemContents = (
    <>
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
      {displaySource && source && <SourceTag source={source} />}
    </>
  );

  // The contents of the expanded area when the expand button on the right of the menu item
  // is clicked. Contains an option for each available provenance
  const ProvenancePicker = forwardRef<
    HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => (
    <div {...props} ref={ref} onClick={e => {e.stopPropagation(); e.preventDefault()}}>
      <div className="tol-provenance-picker" role="listbox">
        {provenances?.map(provenance =>
          <span key={provenance} className="tol-provenance-picker-entry" role="option">
            <RSCheckbox 
              checked={selectedProvenance.includes(provenance)}
              onChange={(_value, checked) => handleProvenanceChange(provenance, checked)}
            >
              {provenance}
            </RSCheckbox>
          </span>
        )}
      </div>
    </div>
  ));

  return (
    <Col className="tol-attribute-selector-menu-item">
      <div key={field} className="tol-attribute-selector-menu-item-container">
        {ItemContents}
        {provenances && provenances.length > 0 && (
          <Button
            outline
            icon={provenancePickerOpen ? "angle-up" : "angle-down"}
            tooltip="Configure Provenance"
            onClick={() => setProvenancePickerOpen(prev => !prev)}
          />
        )}
      </div>
      <RSAnimation.Collapse in={provenancePickerOpen}>
        {(props, ref) => <ProvenancePicker {...props} ref={ref} />}
      </RSAnimation.Collapse>
    </Col>
  );
}