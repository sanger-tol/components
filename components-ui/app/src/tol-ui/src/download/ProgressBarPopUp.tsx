/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useState } from "react";
import { toaster } from "rsuite";
import {
  getDuration,
  ProgressBar,
  PProgressBar,
  PPopUpMessage,
  StaticMessage,
} from "..";

export interface PProgressBarPopUp extends PProgressBar, Pick<PPopUpMessage, "onClose" | "persist" | "header"> {
  /* Hide the progress bar when progress completes */
  hideProgressOnComplete?: boolean;
  /* Message to display while progress is running */
  message?: ReactNode;
  /* Message to display on complete */
  messageOnComplete?: ReactNode;
}

/**
 * @autodoc
 *
 * ProgressBar consumes an async generator and displays its progress.
 */
export function ProgressBarPopUp(props: PProgressBarPopUp) {
  const { persist = true } = props;

  const ProgressBarPopUpMessage = (props: PProgressBarPopUp) => {
    const [progressPopupType, setProgressPopupType] = useState<"success" | "warning">("warning");
    const { header, hideProgressOnComplete, message, messageOnComplete, onClose, onComplete, persist, ...progressBarProps } = props;

    return (
      <StaticMessage
        message={progressPopupType === "success" && hideProgressOnComplete
          ? messageOnComplete
          : (
            <ProgressBar
              {...progressBarProps}
              text={progressPopupType === "success" ? messageOnComplete : message ?? ""}
              onComplete={() => {
                setProgressPopupType("success");
                onComplete?.();
              }}
            />
          )}
        type={progressPopupType}
        header={header}
        bordered={true}
        onClose={onClose}
      />
    );
  };

  toaster.push(<ProgressBarPopUpMessage {...props} />, {
    duration: persist ? getDuration("persist") : getDuration("warning"),
    placement: "bottomEnd",
  });
}