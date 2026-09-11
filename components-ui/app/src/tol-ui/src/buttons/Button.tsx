/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Button as RsButton } from "rsuite";
import { TolLoader, HoverOverlay, Icon, getButtonWrapperClass } from "..";


export interface PButton {
  icon?: string;
  onClick?: (...args: any[]) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  wrapperClassName?: string;
  text?: string | ReactNode;
  disabled?: boolean;
  size?: "md" | "lg";
  type?: string;
  active?: boolean;
  position?: "left" | "right" | "center" | "none";
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

export const Button = React.forwardRef<HTMLButtonElement, PButton>(
  function Button(props, ref) {
    const {
      icon,
      onClick,
      onMouseDown,
      className,
      wrapperClassName,
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
    const isIconOnRight = position === "right";

    const IconElement = icon && <div><Icon icon={icon} size={size} /></div>;
    const TextElement = text && (
      <span style={{ [isIconOnRight ? "marginRight" : "marginLeft"]: icon ? "6px" : "0px" }}>
        {text}
      </span>
    );

    const ButtonContent = (
      <RsButton
        as={Component}
        id={id}
        onClick={handleClick}
        onMouseDown={onMouseDown}
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
        {isIconOnRight ? <>{TextElement}{IconElement}</> : <>{IconElement}{TextElement}</>}
      </RsButton>
    );

    if (!visible) return null;

    return (
      <div className={`${getButtonWrapperClass(position)}${wrapperClassName ? " " + wrapperClassName : ""}`}>
        {contents ? (
          <HoverOverlay
            contents={contents}
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
);