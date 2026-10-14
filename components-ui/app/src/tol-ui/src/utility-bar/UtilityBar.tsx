/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Fragment, ReactNode, useLayoutEffect, useRef, useState } from "react";
import {
  ClickOverlay,
  EditableTitle,
  PEditableTitle,
  PButton,
  Button,
  DeprecatedDropdownButtons,
  PDeprecatedDropdownButtons,
  IconTooltip,
  PDropdownButton,
  DropdownButton,
} from "..";

export interface PUtilityBar {
  /** Optional utility bar ID, used for testing and other purposes. */
  id?: string;
  /** Title displayed on the left; it can be editable when an `onEdit` callback is provided. */
  title?: PEditableTitle;
  /** Description shown in a tooltip beside the title. */
  description?: ReactNode;
  /** Regular and dropdown buttons displayed in the utility bar. */
  buttons?: (
    PButton |
    PDropdownButton |
    PDeprecatedDropdownButtons |
    undefined
  )[];
  /** Custom elements rendered after the title and description, before the buttons. */
  elements?: ReactNode[];
  /** Whether to hide the title and description area. */
  noLeftSide?: boolean;
  /** Additional CSS class names for the utility bar. */
  className?: string;
  /** Maximum visible regular-button count before condensing; defaults to 3. */
  compactButtonThreshold?: number;
}

/**
 * A component that can render a title, description, buttons, and additional elements.
 * This is used as a standardised header bar for various components.
 * The utility bar is responsive and can condense buttons into a dropdown on smaller screens.
 */
export function UtilityBar(props: PUtilityBar) {
  const {
    id,
    title,
    description,
    buttons,
    elements,
    noLeftSide,
    className,
    compactButtonThreshold = 2,
  } = props;

  const wrapperId = "tol-utility-bar-wrapper-" + id;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateBreakpoint = () => {
      setSmallBreakpoint(wrapper.offsetWidth < 600);
    };

    updateBreakpoint();
    const observer = new ResizeObserver(updateBreakpoint);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  // Separate dropdown buttons from regular buttons
  const regularButtons = buttons?.filter(
    (button): button is PButton => Boolean(button && !("dropdownButtons" in button) && !("toggle" in button)),
  );
  const dropdownButtons = buttons?.filter(
    (button): button is PDropdownButton => Boolean(button && "toggle" in button),
  );
  const deprecatedDeprecatedDropdownButtons = buttons?.filter(
    (button): button is PDeprecatedDropdownButtons => Boolean(button && "dropdownButtons" in button),
  );

  const ButtonsComponent = (
    <>
      {regularButtons &&
        regularButtons.map((button, index) => (
          <Button
            key={index}
            {...button}
            position="none"
            className={
              `tol-utility-bar-button ${button && "className" in button ? button.className : ""
              }`
            }
          />
        ))}
    </>
  );

  const DropdownButtonsComponent = (
    <>
      {dropdownButtons &&
        dropdownButtons.map((dropdownButton, index) => (
          <DropdownButton
            key={`dropdown-${index}`}
            {...dropdownButton}
            placement={dropdownButton.placement ?? "bottomEnd"}
            toggle={{ ...dropdownButton.toggle, position: "none" }}
          />
        ))}
    </>
  );

  const DeprecatedDropdownButtonsComponent = (
    <>
      {deprecatedDeprecatedDropdownButtons &&
        deprecatedDeprecatedDropdownButtons.map((button, index) => (
          <DeprecatedDropdownButtons
            key={`dropdown-${index}`}
            {...button}
            mainButtonIcon={{ ...button.mainButtonIcon, position: "none" }}
          />
        ))}
    </>
  );

  const CondensedButtons = (
    <ClickOverlay
      className="tol-utility-bar-compact-popover"
      contents={<div className="tol-utility-bar-buttons tol-utility-bar-buttons-compact">{ButtonsComponent}</div>}
    >
      <div>
        <Button
          testid="condensed-utility-bar-button"
          outline
          position="none"
          type="primary"
          icon="ellipsis-vertical"
        />
      </div>
    </ClickOverlay>
  );

  return (
    <div className={noLeftSide ? "tol-utility-bar-no-left-side" : ""}>
      <div ref={wrapperRef} className={`tol-utility-bar ${className ?? ""}`} data-testid={id} id={wrapperId}>
        {!noLeftSide && title && <EditableTitle {...title} />}
        {!noLeftSide && description && <IconTooltip className="tol-utility-bar-tooltip" contents={description} />}
        {elements && elements.map(
          (element, index) => <Fragment key={index}>{element}</Fragment>
        )}
        <div className="tol-utility-bar-buttons">
          {smallBreakpoint && regularButtons &&
            regularButtons.filter((button) => button?.["visible"] !== false).length > compactButtonThreshold
            ? CondensedButtons
            : ButtonsComponent
          }
          {DropdownButtonsComponent}
          {DeprecatedDropdownButtonsComponent}
        </div>
      </div>
    </div>
  );
}