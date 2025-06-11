/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, HoverOverlay } from "../index";

export type IconType = "check" | "xmark" | "question";

// TODO: Change ValidationIcon style to className
// TODO: Create size type

interface Props {
  iconType: IconType;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
  tooltip?: string;
}

function ValidationIcon(props: Props) {
  const {
    iconType = "check",
    size = "sm",
    style,
    className = "",
    tooltip,
  } = props;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {tooltip ? (
        <HoverOverlay contents={tooltip} delay={200} placement="top">
          <span style={{ ...style, cursor: iconType === "xmark" ? "pointer" : "" }} className={className}>
            <Icon icon={iconType} size={size} />
          </span>
        </HoverOverlay>
      ) : (
        <span style={{ ...style }} className={className}>
          <Icon icon={iconType} size={size} />
        </span>
      )}
    </div>
  );
}

export default ValidationIcon;
