/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button as RsButton } from "rsuite";
import { TolLoader, HoverOverlay, Icon } from "..";

export interface PButton {
  icon?: string;
  onClick?: (...args: any[]) => void;
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
  testid?: string;
}

export function Button(props: PButton) {
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
    testid,
  } = props;

  const outlineClass = outline ? "-outline" : "";
  const contents = disabled && disabledTooltip ? disabledTooltip : tooltip;

  const Loader = () => {
    if (!loading) return null;

    return (
      <span style={{ marginRight: text || icon ? 6 : 0 }}>
        <TolLoader size="sm" />
      </span>
    );
  };

  const ButtonContent = (
    <>
      {visible && (
        <RsButton
          id={id}
          onClick={onClick}
          disabled={disabled}
          active={active}
          className={`icon-button-${type || "primary"}-${
            size || "md"
          }${outlineClass} ${className ? className : ""}`}
          data-testid={testid}
        >
          {Loader()}
          {position === "right" ? (
            <>
              {text && (
                <span style={{ marginRight: icon ? "6px" : "0px" }}>
                  {text}
                </span>
              )}
              {icon && (
                <div>
                  <Icon icon={icon} size={size} />
                </div>
              )}
            </>
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
      )}
    </>
  );

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
          <div className="tooltip-wrapper">{ButtonContent}</div>
        </HoverOverlay>
      ) : (
        ButtonContent
      )}
    </div>
  );
}
