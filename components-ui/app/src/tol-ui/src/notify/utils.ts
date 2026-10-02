/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { nanoid } from "nanoid";
import {
  PopUpMessage,
  BUS_MESSAGE_OBJECT_TYPE,
  MAX_EMAILS_ALLOWED,
  NOTIFY_CATEGORY,
  APP_NAME,
} from "..";
import type { TsDataSource, INotificationOptions, TDataObjectListOrNull } from "..";

/**
 * Builds a bus message that requests an email notification.
 *
 * Recipient addresses are trimmed, lowercased, and deduplicated. If more than
 * {@link MAX_EMAILS_ALLOWED} unique addresses remain, an error is shown and no
 * message is returned.
 *
 * @param options - Notification recipients, template type, context, and target app.
 * @returns The notification bus message, or `undefined` when the recipient limit is exceeded.
 */
export function buildNotificationMessage({
  emails,
  type,
  context,
  targetApp = APP_NAME,
}: INotificationOptions) {
  const id = nanoid();
  const recipients = [
    ...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ].map((email) => ({ email }));

  if (recipients.length > MAX_EMAILS_ALLOWED) {
    PopUpMessage({
      message: `You can only send notifications to a maximum of ${MAX_EMAILS_ALLOWED} email addresses.`,
      type: "error",
    });
    return;
  }

  return {
    type: BUS_MESSAGE_OBJECT_TYPE,
    id,
    attributes: {
      routing_key: `${NOTIFY_CATEGORY}.${targetApp}.${type}`,
      body: {
        id,
        type: "notification",
        source: APP_NAME,
        created_at: new Date().toISOString(),
        context: {
          id,
          channels: ["email"],
          type,
          recipients,
          context,
        },
      },
    },
  };
}

/**
 * Builds and inserts a notification bus message into the data source.
 *
 * @param dataSource - Data source used to insert the bus message.
 * @param options - Notification recipients, template type, context, and target app.
 * @param params - Optional parameters forwarded to the data-source insert operation.
 * @returns A promise that resolves when the insert operation completes.
 */
export async function sendNotification(
  dataSource: TsDataSource,
  options: INotificationOptions,
  params?: Record<string, unknown>,
): Promise<TDataObjectListOrNull> {

  const payload = buildNotificationMessage(options);

  if (!payload) {
    return null;
  }

  return await dataSource.insert({
    payload: [payload],
    objectType: BUS_MESSAGE_OBJECT_TYPE,
    params,
  });
}
