/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Message as RSMessage } from "rsuite";
import { capitaliseFirstLetter } from "../general/utils";

export type messageType = "success" | "info" | "warning" | "error";

interface Props {
  children: React.ReactNode;
  showIcon: boolean;
  type?: messageType;
  closable?: boolean;
  header?: React.ReactNode;
  onClose?: () => void;
  styles?: React.CSSProperties;
  hidePrefix?: boolean;
  bordered?: boolean;
}

const Message = React.forwardRef<HTMLDivElement, Props>(
  (props: Props, ref: React.Ref<HTMLDivElement>) => {
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
      <div ref={ref} style={{ ...styles, marginBottom: "4px" }}>
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
  },
);

export default Message;
