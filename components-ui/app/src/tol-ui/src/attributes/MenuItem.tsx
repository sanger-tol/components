/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Animation as RSAnimation } from "rsuite";

import {
  AttributeTitle,
  Col,
  ExpandButton,
  handleExpandButtonKeyDownEvent,
  Icon,
  SourceTag,
  truncateString,
  TsDataSource,
} from "..";
import { ProvenancePicker } from "./ProvenancePicker";

export interface PMenuItem {
  /**
   * Source identifier shown in the source tag
   */
  source: string;
  /**
   * The attribute this menu item describes
   */
  field: string;
  /**
   * Whether the attribute is marked as authoritative
   */
  authoritative: boolean;
  /**
   * Object type used to resolve attribute metadata
   */
  objectType: string;
  /**
   * Data source to fetch attribute metadata with
   */
  dataSource: TsDataSource;
  /**
   * Whether to display the source tag in the menu item
   */
  displaySource?: boolean;
  /**
   * Optional tooltip content for the menu item
   */
  tooltipContent?: string;
  /**
   * The values in the AttributeSelector that are disabled.
   * This MenuItem is disabled if this contains `field`.
   */
  disabledValues?: any;
  /**
   * The provenances available for this attribute that are displayed in the Provanence picker.
   * If this is not provided (or an empty list), then this attribute does not use Provenance.
   */
  provenancesAvailable?: string[];
  /**
   * Currently selected provenance fields for this attribute
   */
  provenancesSelected?: string[];
  /**
   * Callback fired when provenance selections change
   * (used to update provenances selected state in a parent component)
   */
  onProvenancesChanged?: (newProvenances: string[]) => void
}

/**
 * Renders an attribute selection menu item with optional source display
 * and an expandable provenance picker for configuring selected provenances.
 */
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

  /**
   * The contents of the main item entry showing the non-provenance field
   */
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

  const AnimatedProvenancePicker = forwardRef<
    HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => (
    <div {...props} ref={ref}>
      <ProvenancePicker
        provenancesAvailable={provenancesAvailable}
        provenancesSelected={provenancesSelected}
        onProvenancesChanged={onProvenancesChanged ?? (() => {})}
      />
    </div>
  ));

  return (
    <Col
      className="tol-attribute-selector-menu-item"
      data-provenance-open={provenancePickerOpen}
    >
      <div key={field} className="tol-attribute-selector-menu-item-container">
        {MenuItemAttributeTitle}
        <span className="tol-attribute-selector-menu-item-right-container">
          {displaySource && source && <SourceTag source={source} />}
          {provenancesAvailable.length > 0 && (
            <span
              // Prevent clicking the expand control from selecting the parent menu option
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => handleExpandButtonKeyDownEvent(event, provenancePickerOpen)}
            >
              <ExpandButton
                testid={`attribute-selector-provenance-toggle-${field}`}
                expanded={provenancePickerOpen}
                setExpanded={setProvenancePickerOpen}
                tooltip={
                  provenancePickerOpen
                    ? "Collapse Provenance Picker"
                    : "Configure Provenance"
                }
              />
            </span>
          )}
        </span>
      </div>
      <RSAnimation.Collapse in={provenancePickerOpen}>
        {(props, ref) => <AnimatedProvenancePicker {...props} ref={ref} />}
      </RSAnimation.Collapse>
    </Col>
  );
}
