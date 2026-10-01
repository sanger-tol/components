/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message, TMessageType } from "..";


export interface PStaticMessage {
  /** The message content to be displayed */
  message: React.ReactNode;
  /** The type of the message (e.g., info, warning, error) */
  type?: TMessageType;
  /** Whether to display the header */
  header?: boolean;
  /** Callback function to be called when the message is closed */
  onClose?: () => void;
  /** Whether the message should have a border */
  bordered?: boolean;
  /** Additional CSS class for the message container */
  className?: string;
  /** Inline styles for the message container */
  style?: React.CSSProperties;
}

function InternalStaticMessage(props: PStaticMessage, ref: React.Ref<HTMLDivElement>) {
  const { message, type, header, onClose, ...rest } = props;

  return (
    <div ref={ref}>
      <Message
        children={message}
        type={type}
        showIcon={true}
        onClose={onClose}
        hidePrefix={true}
        closable={true}
        bordered={true}
        header={header && "Message"}
        {...rest}
      />
    </div>
  );
}

export const StaticMessage = React.forwardRef<HTMLDivElement, PStaticMessage>(InternalStaticMessage);
