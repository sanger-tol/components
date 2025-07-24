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
}

export const PopUpMessage = (props: PPopUpMessage) => {
  const { type, message, header, onClose } = props;
  toaster.push(
    <StaticMessage
      message={message}
      type={type}
      header={header}
      bordered={true}
      onClose={onClose}
    />,
    {
      duration: getDuration(type),
      placement: "bottomEnd",
    },
  );
};
