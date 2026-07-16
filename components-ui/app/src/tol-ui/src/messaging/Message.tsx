/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message as RSMessage } from "rsuite";
import { capitaliseFirstLetter } from "../general/utils";
import { TMessageType } from "..";

export interface PMessage {
  children: React.ReactNode;
  showIcon: boolean;
  type?: TMessageType;
  closable?: boolean;
  header?: React.ReactNode;
  onClose?: () => void;
  styles?: React.CSSProperties;
  hidePrefix?: boolean;
  bordered?: boolean;
}

function InternalMessage(props: PMessage, ref: React.Ref<HTMLDivElement>) {
  const {
    children,
    showIcon,
    closable,
    type,
    header,
    onClose,
    styles,
    hidePrefix,
    bordered,
    ...rest
  } = props;

  return (
    <div ref={ref} style={styles}>
      <RSMessage
        closable={closable}
        showIcon={showIcon}
        type={type}
        header={header}
        bordered={bordered}
        onClose={onClose}
        {...rest}
      >
        {typeof children === "string" && type && !hidePrefix && (
          <strong>{capitaliseFirstLetter(type)}! </strong>
        )}
        {children}
      </RSMessage>
    </div>
  );
}

export const Message = React.forwardRef<HTMLDivElement, PMessage>(InternalMessage);
