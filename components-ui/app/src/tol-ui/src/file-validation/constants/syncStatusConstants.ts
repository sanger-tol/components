/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Sync status polling timing configuration constants
 */

/** Maximum duration to continue polling for sync status updates (5 minutes) */
export const MAX_SYNC_DURATION = 300000; // 5 minutes

/** Initial delay before first sync status poll (60 seconds) */
export const INITIAL_DELAY = 60000; // 60 seconds

/** Interval between sync status polls (30 seconds) */
export const POLL_INTERVAL = 30000; // 30 seconds
