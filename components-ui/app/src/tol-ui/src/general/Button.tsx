/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button as RsButton } from "rsuite";
import { TolLoader, HoverOverlay, Icon } from "../index";

export interface IButton {
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
  id?: string;
  visible?: boolean;
}


function Button(props: IButton) {
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
    id,
    visible = true,
  } = props;

  const outlineClass = outline ? "-outline" : "";

  const loader = <TolLoader size="sm" />;

  const button = (
    <>
      {visible &&
        <RsButton
          id={id}
          onClick={onClick}
          disabled={disabled || loading}
          active={active}
          className={
            `icon-button-${type || 
            "primary"}-${size || 
            "md"}${outlineClass} ${className ? className : ""}`
          }
        >
          {loading ? (
            loader
          ) : (
            <>
              {icon && (
                <div>
                  <Icon icon={icon} size={size} />
                </div>
              )}
              {text && (
                <span style={{ marginLeft: icon ? "6px" : "0px" }}>{text}</span>
              )}
            </>
          )}
        </RsButton>
      }
    </>
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
          delay={disabled ? undefined : 800}
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
