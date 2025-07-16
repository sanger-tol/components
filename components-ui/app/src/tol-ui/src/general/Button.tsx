/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { Button as RsButton } from "rsuite";
import {
  TolLoader,
  HoverOverlay,
  Icon
} from "..";

export interface IButton {
  icon?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  limit?: number;
  timeout?: number;
  testid?: string;
}

export function Button(props: IButton) {
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
    limit = 0,
    timeout = 0,
  } = props;

  const [buttonClicked, setButtonClicked] = useState<number>(0);
  const [timeoutDisabled, setTimeoutDisabled] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }

    if (limit > 0) {
      setButtonClicked((prev: number) => {
        const newCount = prev + 1;

        if (newCount >= limit) {
          setTimeout(() => {
            setButtonClicked(0);
          }, timeout);
        }

        return newCount;
      });
    } else if (limit === 0 && timeout > 0) {
      setTimeoutDisabled(true);
      setTimeout(() => {
        setTimeoutDisabled(false);
      }, timeout);
    }
  };

  const outlineClass = outline ? "-outline" : "";

  const loader = <TolLoader size="sm" />;

  const button = (
    <>
      {visible && (
        <RsButton
          id={id}
          onClick={handleClick}
          disabled={
            disabled ||
            loading ||
            (limit > 0 && buttonClicked >= limit) ||
            timeoutDisabled
          }
          active={active}
          className={`icon-button-${type || "primary"}-${
            size || "md"
          }${outlineClass} ${className ? className : ""}`}
          data-testid={testid}
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
      )}
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
