/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { StaticMessage, TMessageType, getDuration } from "..";
import { toaster } from "rsuite";

export interface PPopUpMessage {
  type: TMessageType;
  message: string;
  header?: boolean;
  onClose?: () => void;
  persist?: boolean;
}

export function PopUpMessage(props: PPopUpMessage) {
  const { type, message, header, onClose, persist = false } = props;
  toaster.push(
    <StaticMessage
      message={message}
      type={type}
      header={header}
      bordered={true}
      onClose={onClose}
    />,
    {
      duration: persist ? getDuration("persist") : getDuration(type),
      placement: "bottomEnd",
    },
  );
}
