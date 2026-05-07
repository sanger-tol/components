/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Fragment, ReactNode, useState } from "react";
import {
  ClickOverlay,
  EditableTitle,
  PEditableTitle,
  PButton,
  PDropdownButtons,
  Button,
  DropdownButtons,
  resizeListener,
  IconTooltip,
} from "..";

export interface PUtilityBar {
  /**
   * An optional ID for the utility bar, which can be used for testing or other purposes.
   */
  id?: string;
  /**
   * A title to be displayed on the left side of the utility bar. This can be an editable title if an `onEdit` function is provided.
   */
  title?: PEditableTitle;
  /**
   * A description to be displayed as a tooltip on an info icon next to the title.
   */
  description?: ReactNode;
  /**
   * An array of buttons to be displayed in the utility bar. These can be regular buttons or dropdown buttons.
   */
  buttons?: (
    PButton |
    PDropdownButtons |
    undefined
  )[];
  /**
   * Additional elements to be rendered in the utility bar, after the title and description but before the buttons. This can be used to add custom content to the utility bar.
   */
  elements?: JSX.Element[];
  /**
   * Whether to hide the left side of the utility bar, which includes the title and description.
   */
  noLeftSide?: boolean;
  /**
   * Additional class name(s) to apply to the utility bar.
   */
  className?: string;
}

/**
 * A component that can render a title, description, buttons, and additional elements.
 * This is used as a standardised header bar for various components.
 * The utility bar is responsive and can condense buttons into a dropdown on smaller screens.
 */
export function UtilityBar(props: PUtilityBar) {
  const { id, title, description, buttons, elements, noLeftSide, className } = props;

  const wrapperId = "tol-utility-bar-wrapper-" + id; // gets width on mount
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);

  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) setSmallBreakpoint(width < 600);
  });

  // Separate dropdown buttons from regular buttons
  const dropdownButtons = buttons?.filter(button => button && "dropdownButtons" in button);
  const regularButtons = buttons?.filter(button => button && !("dropdownButtons" in button));

  const ButtonsComponent = (
    // remove left-most button margin
    <div style={{ marginLeft: "-6px" }}>
      {regularButtons &&
        regularButtons.map((button, index) => (
          <Button
            key={index}
            {...button}
            className={
              `tol-utility-bar-button ${button && "className" in button ? button.className : ""
              }`
            }
          />
        ))}
    </div>
  );

  const DropdownButtonsComponent = (
    <div style={{ marginLeft: "-6px" }}>
      {dropdownButtons &&
        dropdownButtons.map((button, index) => (
          <div style={{ float: "right" }} key={`dropdown-${index}`}>
            <DropdownButtons {...(button as PDropdownButtons)} />
          </div>
        ))}
    </div>
  );

  const CondensedButtons = (
    <ClickOverlay contents={ButtonsComponent}>
      <div style={{ float: "right" }}>
        <Button
          testid="condensed-utility-bar-button"
          outline
          position="right"
          type="primary"
          icon="ellipsis-vertical"
        />
      </div>
    </ClickOverlay>
  );

  return (
    <div className={noLeftSide ? "tol-utility-bar-no-left-side" : ""}>
      <div className={`tol-utility-bar ${className ?? ""}`} data-testid={id} id={wrapperId}>
        {!noLeftSide && title && <EditableTitle {...title} />}
        {!noLeftSide && description && <IconTooltip className="tol-utility-bar-tooltip" contents={description} />}
        {elements && elements.map(
          (element, index) => <Fragment key={index}>{element}</Fragment>
        )}
        <div className="tol-utility-bar-buttons">
          {smallBreakpoint && regularButtons &&
            regularButtons.filter((button) => button?.["visible"] !== false).length > 2
            ? CondensedButtons
            : ButtonsComponent
          }
          {DropdownButtonsComponent}
        </div>
      </div>
    </div>
  );
}