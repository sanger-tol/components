/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Ensures every consumer's database has the sync bookkeeping table, regardless of their own schema.
export const SYNC_METADATA_STATEMENT = `CREATE TABLE IF NOT EXISTS SyncMetadata (
  table_name TEXT PRIMARY KEY,
  last_synced_at INTEGER NOT NULL
);`;
