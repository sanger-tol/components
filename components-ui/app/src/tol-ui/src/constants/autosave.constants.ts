/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const AUTOSAVE_DELAY_MS = 3000;

export const AUTOSAVE_STATE_ICONS = (time?: string) =>
  ({
    idle: { icon: "pause", text: "No changes to save" },
    pending: { icon: "ellipsis", text: "Unsaved changes" },
    saving: { icon: "floppy-disk", text: "Saving..." },
    saved: {
      icon: "check",
      text: time ? `Saved ${time}` : "Saved",
    },
    error: { icon: "xmark", text: "Could not save." },
  }) as const;

