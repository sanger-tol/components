/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Icon, AUTOSAVE_STATE_ICONS } from "..";
import type { TAutosaveStatus } from "..";

export interface PAutosaveStatus {
  /** The status of the current save cycle */
  status: TAutosaveStatus;
  /** The last successful save date */
  lastSavedAt: Date | null;
  /** Function to run if saving fails */
  onRetry: () => void;
}

/** An auto save component that shows the status of the save and the time if successful */
export function AutosaveStatus(props: PAutosaveStatus) {
  const { status, lastSavedAt, onRetry } = props;

  const time = lastSavedAt?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentSaveState = AUTOSAVE_STATE_ICONS(time)[status];

  return (
    <div role="status" className="tol-autosave-status">
      <Icon
        icon={currentSaveState.icon}
        className={`tol-autosave-status__icon ${status}`}
      />
      <span>{currentSaveState.text}</span>
      {status === "error" && (
        <Button
          text="Retry"
          onClick={onRetry}
          className="tol-autosave-status__retry_button"
        />
      )}
    </div>
  );
}
