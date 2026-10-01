/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CSSProperties, forwardRef, ReactNode, useState } from "react";
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

// rsuite's toaster injects a ref and transition className/style; these must reach the DOM for the toast to be removed on close.
const ProgressBarPopUpMessage = forwardRef<
  HTMLDivElement,
  PProgressBarPopUp & { className?: string; style?: CSSProperties }
>((props, ref) => {
  const [progressPopupType, setProgressPopupType] = useState<"success" | "warning">("warning");
  const {
    className,
    style,
    header,
    hideProgressOnComplete,
    message,
    messageOnComplete,
    onClose,
    onComplete,
    persist,
    ...progressBarProps
  } = props;

  return (
    <StaticMessage
      ref={ref}
      className={className}
      style={style}
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
});

/**
 * @autodoc
 *
 * ProgressBar consumes an async generator and displays its progress.
 */
export function ProgressBarPopUp(props: PProgressBarPopUp) {
  const { persist = true } = props;

  toaster.push(<ProgressBarPopUpMessage {...props} />, {
    duration: persist ? getDuration("persist") : getDuration("warning"),
    placement: "bottomEnd",
  });
}