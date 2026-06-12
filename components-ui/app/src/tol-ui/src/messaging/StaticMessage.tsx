/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message, TMessageType } from "..";

interface PStaticMessage {
  message: React.ReactNode;
  type?: TMessageType;
  header?: boolean;
  onClose?: () => void;
  bordered?: boolean;
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
