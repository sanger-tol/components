/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Icon, HoverOverlay, TolLoader, TIconType } from "..";

export interface PValidationIcon {
  iconType: TIconType;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
  tooltip?: React.ReactNode;
  completed?: boolean;
  completedCheck?: boolean;
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
  } = props;

  const iconContent =
    !completed && completedCheck ? (
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
