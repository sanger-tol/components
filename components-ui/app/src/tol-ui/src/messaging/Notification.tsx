/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Notification as RSNotification } from "rsuite";
import { TMessageType, TPlacement } from "..";

export interface PNotification {
  children: React.ReactNode;
  closable?: boolean;
  header?: string;
  onClose?: () => void;
  placement?: TPlacement;
  type: TMessageType;
}

function InternalNotification(props: PNotification, ref: React.Ref<HTMLDivElement>) {
  const { children, closable, type, header, onClose, ...rest } = props;

  return (
    <div ref={ref} style={{ marginBottom: "4px" }}>
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

export const Notification = React.forwardRef<HTMLDivElement, PNotification>(InternalNotification);
