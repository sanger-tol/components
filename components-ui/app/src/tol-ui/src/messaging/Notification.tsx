/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Notification as RSNotification } from "rsuite";
import { type } from "./Message";

type placement =
  | "topCenter"
  | "topStart"
  | "topEnd"
  | "bottomCenter"
  | "bottomStart"
  | "bottomEnd";

interface Props {
  children: React.ReactNode;
  closable?: boolean;
  header?: string;
  onClose?: () => void;
  placement?: placement;
  type: type;
}

const Notification = React.forwardRef<HTMLDivElement, Props>(
  (props: Props, ref: React.Ref<HTMLDivElement>) => {
    const { children, closable, type, header, onClose, ...rest } = props;

    return (
      <div
        ref={ref}
        style={{ marginBottom: "4px" }}
      >
        <RSNotification
          closable={closable}
          type={type}
          header={header}
          onClose={onClose}
          {...rest}
        >
          {children}
        </RSNotification>
      </div>
    );
  }
);

export default Notification;
