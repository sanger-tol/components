/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message, TMessageType } from "..";

export interface PStatusMessage {
  message: string;
  status: TMessageType;
  bordered?: boolean;
}

export const StatusMessage = React.forwardRef<HTMLDivElement, PStatusMessage>(
  (props: PStatusMessage, ref: React.Ref<HTMLDivElement>) => {
    const { message, status, bordered, ...rest } = props;

    return (
      <div ref={ref} className="status-message tol-status">
        <Message
          children={message}
          type={status}
          showIcon={true}
          onClose={() => null}
          hidePrefix={true}
          closable={false}
          header={false}
          bordered={bordered}
          {...rest}
        />
      </div>
    );
  },
);
