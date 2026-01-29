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
  id?: string;
  title?: PEditableTitle;
  description?: ReactNode;
  buttons?: (
    PButton |
    PDropdownButtons |
    undefined
  )[];
  elements?: JSX.Element[];
}

export function UtilityBar(props: PUtilityBar) {
  const { id, title, description, buttons, elements } = props;

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
            className="tol-utility-bar-button"
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
    <div className="tol-utility-bar" data-testid={id} id={wrapperId}>
      {title && <EditableTitle {...title} />}
      {description && <IconTooltip className="tol-utility-bar-tooltip" contents={description} />}
      {elements && elements.map(
        (element, index) => <Fragment key={index}>{element}</Fragment>
      )}
      <div className="tol-utility-bar-buttons">
        {smallBreakpoint && regularButtons &&
          regularButtons.filter((button) => button?.["visible"] !== false).length > 1
          ? CondensedButtons
          : ButtonsComponent
        }
        {DropdownButtonsComponent}
      </div>
    </div>
  );
}