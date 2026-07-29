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
}

export function MenuItem(props: PMenuItem) {
  const { source, field, authoritative, disabledValues,
    objectType, dataSource, displaySource } = props;
  
  const [provenancePickerOpen, setProvenancePickerOpen] = useState(false);

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

  const ProvenancePicker = forwardRef<
    HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => (
    <div {...props} ref={ref} onClick={e => {e.stopPropagation(); e.preventDefault()}}>
      <div className="tol-provenance-picker">
        <span className="tol-provenance-picker-entry">
          <RSCheckbox>STS</RSCheckbox>
        </span>
        <span className="tol-provenance-picker-entry">
          <RSCheckbox>Benchling</RSCheckbox>
        </span>
      </div>
    </div>
  ));

  return (
    <Col className="tol-attribute-selector-menu-item">
      <div key={field} className="tol-attribute-selector-menu-item-container">
        {ItemContents}
        {true && ( // TODO change to some indicator of provenance being active
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