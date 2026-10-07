/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TTolApp, TNotificationContext } from "..";

/** Options for sending a notification. */
export interface INotificationOptions {
  /** List of recipient email addresses. */
  emails: string[];
  /** Template name on the consumer (`<type>.subject.txt` / `<type>.body.html`). */
  type: string;
  /** Variables available to the email template. */
  context: TNotificationContext;
  /** Defaults to this app. Other apps are rejected (403) until site-to-site is enabled. */
  targetApp?: TTolApp;
}
