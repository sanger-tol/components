/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message } from "./index";
import { MessageType } from "./Message";

interface Props {
  message: string;
  type?: MessageType;
  header?: boolean;
  onClose?: () => void;
  bordered?: boolean;
}

export const StaticMessage = React.forwardRef<HTMLDivElement, Props>(
  (props: Props, ref: React.Ref<HTMLDivElement>) => {
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
  },
);
