/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Must match each app's RABBITMQ_APP_NAME exactly.
export type TTolApp =
  | "portal"
  | "bioscan"
  | "genome-notes"
  | "bga"
  | "tolqc"
  | "sts"
  | "tolid"
  | "workflows"
  | "psyche"
  | "treeofsex"
  | "components";

export type TNotificationContext = Record<
  string,
  string | number | boolean | null
>;
