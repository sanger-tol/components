/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message } from "./index";
import { messageType } from "./Message";

interface Props {
  message: string;
  status: messageType;
  bordered?: boolean;
}

const StatusMessage = React.forwardRef<HTMLDivElement, Props>(
  (props: Props, ref: React.Ref<HTMLDivElement>) => {
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
  }
);

export default StatusMessage;
