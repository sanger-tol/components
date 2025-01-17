/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { StaticMessage } from "./index";
import { messageType } from "./Message";
import { toaster } from "rsuite";

interface Props {
  type: messageType;
  message: string;
  header?: boolean;
  onClose?: () => void;
}

enum Duration {
  success = 4000,
  info = 6000,
  warning = 8000,
  error = 30000,
  default = 6000,
}

const getDuration = (type: Props["type"]) => {
  switch (type) {
    case "success":
      return Duration.success;
    case "info":
      return Duration.info;
    case "warning":
      return Duration.warning;
    case "error":
      return Duration.error;
    default:
      return Duration.default;
  }
};

const PopUpMessage = (props: Props) => {
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
    }
  );
};

export default PopUpMessage;
