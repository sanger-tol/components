/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Button as RsButton } from "rsuite";
import { TolLoader, HoverOverlay, Icon } from "..";

export interface PButton {
  icon?: string;
  onClick?: (...args: any[]) => void;
  className?: string;
  text?: string | ReactNode;
  disabled?: boolean;
  size?: "md" | "lg";
  type?: string;
  active?: boolean;
  position?: "left" | "right" | "none";
  tooltip?: string;
  disabledTooltip?: string;
  loading?: boolean;
  outline?: boolean;
  id?: string;
  visible?: boolean;
  limit?: number;
  timeout?: number;
  testid?: string;
  as?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, PButton>(function Button(props, ref) {
  const {
    icon,
    onClick,
    className,
    text,
    disabled,
    size,
    type = "primary",
    active,
    position = "none",
    tooltip,
    disabledTooltip,
    loading,
    outline,
    id,
    visible = true,
    testid,
    as: Component = "button",
    limit = 0,
    timeout = 0,
  } = props;

  const [buttonClicked, setButtonClicked] = useState<number>(0);
  const [timeoutDisabled, setTimeoutDisabled] = useState<boolean>(false);
  const mouseUpListenerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const clearMouseUpListener = () => {
    if (mouseUpListenerRef.current && typeof window !== "undefined") {
      window.removeEventListener("mouseup", mouseUpListenerRef.current);
      mouseUpListenerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearMouseUpListener();
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    ...args: any[]
  ) => {
    onClick?.(event, ...args);

    if (limit > 0) {
      setButtonClicked((prev) => {
        const newCount = prev + 1;

        if (newCount >= limit) {
          setTimeout(() => setButtonClicked(0), timeout);
        }

        return newCount;
      });
      return;
    }

    if (timeout > 0) {
      setTimeoutDisabled(true);
      setTimeout(() => setTimeoutDisabled(false), timeout);
    }
  };

  const outlineClass = outline ? "-outline" : "";
  const contents = disabled && disabledTooltip ? disabledTooltip : tooltip;
  const isDisabled =
    !!disabled ||
    (!!loading && timeout > 0) ||
    (limit > 0 && buttonClicked >= limit) ||
    timeoutDisabled;

  const buttonContent = (
    <RsButton
      as={Component}
      id={id}
      onClick={handleClick}
      disabled={isDisabled}
      active={active}
      className={`icon-button-${type}-${size || "md"}${outlineClass} ${className || ""}`}
      data-testid={testid}
      ref={ref}
    >
      {loading && (
        <span style={{ marginRight: text || icon ? 6 : 0 }}>
          <TolLoader size="sm" />
        </span>
      )}

      {position === "right" ? (
        <>
          {text && <span style={{ marginRight: icon ? "6px" : "0px" }}>{text}</span>}
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
          {text && <span style={{ marginLeft: icon ? "6px" : "0px" }}>{text}</span>}
        </>
      )}
    </RsButton>
  );

  if (!visible) return null;

  return (
    <div
      style={{
        float: position === "none" ? undefined : position,
        marginLeft: position === "right" ? "6px" : "0px",
        marginRight: position === "left" ? "6px" : "0px",
      }}
    >
      {contents ? (
        <HoverOverlay
          contents={contents}
          followCursor={disabled}
          delay={disabled ? undefined : 800}
        >
          <div className="tooltip-wrapper">{buttonContent}</div>
        </HoverOverlay>
      ) : (
        buttonContent
      )}
    </div>
  );
});