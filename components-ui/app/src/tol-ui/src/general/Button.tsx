/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button as RsButton } from "rsuite";
import {
  TolLoader,
  HoverOverlay,
  Icon
} from "..";

export interface IButton {
  /** Optional font-awesome icon */ 
  icon?: string;
  /** Function to call when the button is clicked */
  onClick?: () => void;
  /** Optional class name to add to the button */
  className?: string;
  /** Optional text to display on the button */
  text?: string;
  /** Optional flag to disable the button */
  disabled?: boolean;
  /** Optional size of the button */
  size?: "md" | "lg";
  /** Optional type of the button */
  type?: string;
  /** Optional flag to indicate if the button is active */
  active?: boolean;
  /** Optional position of the button */
  position?: "left" | "right";
  /** Optional tooltip to display when hovering over the button */
  tooltip?: string;
  /** Optional tooltip to display when the button is disabled */
  disabledTooltip?: string;
  /** Optional flag to indicate if the button is loading and show a spinner */
  loading?: boolean;
  /** Optional flag to indicate if the button should have an outline style */
  outline?: boolean;
  /** Optional id for the button */
  id?: string;
  /** Optional flag to control the visibility of the button */
  visible?: boolean;
}


export function Button(props: IButton) {
  const {
    icon,
    onClick,
    className,
    text,
    disabled = false,
    size = "md",
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
