/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Icon, HoverOverlay, TolLoader, TIconType } from "../..";

export interface PValidationIcon {
  /**
   * Type of icon to show, used to determine the colour and icon content.
   */
  iconType: TIconType;
  /**
   * Optional size of the icon, defaults to 16px, used to determine the size of the icon content. 
   * Can be set to "inherit" to inherit the font size of the parent element.
   */
  size?: string;
  /**
   * Optional style, used to apply custom styles to the component
   */
  style?: React.CSSProperties;
  /**
   * Optional className, used to apply custom CSS classes to the component
   */
  className?: string;
  /**
   * Optional tooltip content, used to show a tooltip when hovering over the icon, 
   * can be set to any React node (e.g. string, JSX element)
   */
  tooltip?: React.ReactNode;
  /**
   * Optional whether validation has completed, used to determine whether to show 
   * the loading state (if completedCheck is true) and show particular icons for passed/failed states
   */
  completed?: boolean;
  /**
   * Optional whether to check for completion, used in conjunction with `completed` to determine the icon state
   */
  completedCheck?: boolean;
  /**
   * Optional whether validation has failed, used to determine the icon state
   */
  failed?: boolean;
}

export function ValidationIcon(props: PValidationIcon) {
  const {
    iconType,
    size,
    style,
    className,
    tooltip,
    completed,
    completedCheck = false,
    failed,
  } = props;

  const iconContent =
    !completed && completedCheck && !failed ? (
      <TolLoader />
    ) : (
      <Icon icon={iconType} size={size} />
    );

  return (
    <div>
      {tooltip ? (
        <HoverOverlay contents={tooltip} delay={200} placement="top">
          <span
            style={{ ...style }}
            className={`${className} ${
              (completed && iconType === "xmark") ||
              (completed && iconType === "exclamation")
                ? "pointer"
                : ""
            }`}
          >
            {iconContent}
          </span>
        </HoverOverlay>
      ) : (
        <span style={{ ...style }} className={className}>
          {iconContent}
        </span>
      )}
    </div>
  );
}

export default ValidationIcon;
