/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState } from "react";
import {
  ClickOverlay,
  InlineEdit,
  PInlineEdit,
  PButton,
  PDropdownButtons,
  Button,
  DropdownButtons,
  resizeListener,
  IconTooltip,
} from "..";
import { TitleTooltip } from "src/boards/TitleTooltip";

export interface PUtilityBar {
  id?: string;
  title?: PInlineEdit;
  description?: ReactNode;
  buttons?: (PButton | PDropdownButtons | undefined)[];
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

  const Toolip = (
    <TitleTooltip
      title={title}
      description={description}
    />
  );

  const Buttons = (
    // remove left-most button margin
    <div style={{ marginLeft: "-6px" }}>
      {buttons &&
        buttons.map((button, index) => {
          if (button) {
            if ("dropdownButtons" in button) {
              return (
                <div style={{ float: "right" }} key={index}>
                  <DropdownButtons {...button} />
                </div>
              );
            }
            return (
              <Button
                key={index}
                {...button}
                className="tol-utility-bar-button"
              />
            );
          }
        })}
    </div>
  );

  const CondensedButtons = (
    <ClickOverlay contents={Buttons} closeOnClick>
      <div style={{ float: "right" }}>
        <Button
          outline
          position="right"
          type="primary"
          icon="ellipsis-vertical"
        />
      </div>
    </ClickOverlay>
  );

  return (
    <div className="tol-utility-bar" id={wrapperId}>
      {title && <InlineEdit {...title} size={smallBreakpoint ? "sm" : "md"} />}
      {description && <IconTooltip contents={Toolip} />}
      {elements &&
        elements.map((element, index) => (
          <div key={index} style={{ float: "left" }}>
            {element}
          </div>
        ))}
      <div className="tol-utility-bar-buttons">
        {smallBreakpoint &&
        buttons &&
        // only takes into account buttons that are visible
        buttons.filter((button) => button?.["visible"] !== false).length > 1
          ? CondensedButtons
          : Buttons}
      </div>
    </div>
  );
}
