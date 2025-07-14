/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Icon, HoverOverlay, TolLoader } from "../index";
import { IconType } from "./utils";

interface Props {
  iconType: IconType;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
  tooltip?: React.ReactNode;
  completed?: boolean;
  completedCheck?: boolean;
}

const OVERLAY_DELAY = 200;
const OVERLAY_PLACEMENT = "top";

function ValidationIcon(props: Props) {
  const {
    iconType,
    size,
    style,
    className,
    tooltip,
    completed,
    completedCheck = false,
  } = props;

  return (
    <div>
      {tooltip ? (
        <HoverOverlay
          contents={tooltip}
          delay={OVERLAY_DELAY}
          placement={OVERLAY_PLACEMENT}
        >
          <span
            className={`${className} ${
              iconType === "xmark" || iconType === "exclamation"
                ? "pointer"
                : ""
            }`}
          >
            <Icon icon={iconType} size={size} />
          </span>
        </HoverOverlay>
      ) : (
        <span style={{ ...style }} className={className}>
          {!completed && completedCheck ? (
            <TolLoader />
          ) : (
            <Icon icon={iconType} size={size} />
          )}
        </span>
      )}
    </div>
  );
}

export default ValidationIcon;
