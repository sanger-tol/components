/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button as RsButton } from "rsuite";
import { TolLoader, HoverOverlay, Icon } from "../index";

interface Props {
  icon?: string;
  onClick?: () => void;
  className?: string;
  text?: string;
  disabled?: boolean;
  size?: "md" | "lg";
  type?: string;
  active?: boolean;
  position?: "left" | "right";
  tooltip?: string;
  disabledTooltip?: string;
  loading?: boolean;
  outline?: boolean;
}

function Button(props: Props) {
  const {
    icon,
    onClick,
    className,
    text,
    disabled,
    size,
    type,
    active,
    position = "none",
    tooltip,
    disabledTooltip,
    loading,
    outline,
  } = props;

  const outlineClass = outline ? "-outline" : "";

  const loader = <TolLoader size="sm" />;

  const button = (
    <RsButton
      onClick={onClick}
      disabled={disabled || loading}
      active={active}
      className={`icon-button-${type || "primary"}-${size || "md"}${outlineClass} ${className}`}
    >
      {loading ? (
        loader
      ) : (
        <>
          {icon && (
            <div className="bttn-icon-div">
              <Icon icon={icon} size={size} />
            </div>
          )}
          {text && (
            <span style={{ marginLeft: icon ? "6px" : "0px" }}>{text}</span>
          )}
        </>
      )}
    </RsButton>
  );

  const contents = disabled && disabledTooltip ? disabledTooltip : tooltip;

  return (
    <div
      style={{
        float: position,
        marginLeft: position === "right" ? "6px" : "0px",
        marginRight: position === "left" ? "6px" : "0px",
      }}
    >
      {contents ? (
        <HoverOverlay
          contents={contents!}
          followCursor={disabled}
          delay={disabled ? 300 : 800}
        >
          <div className="tooltip-wrapper">{button}</div>
        </HoverOverlay>
      ) : (
        button
      )}
    </div>
  );
}

export default Button;
