<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Active and inactive column functionality

Active and inactive columns are part of the table column-visibility model for boards.

This functionality allows a board owner to define a restricted set of columns that users are allowed to work with, while still controlling which of those columns are shown by default.

## Core concept

There are two related states for table columns when limited visibility is enabled:

- `Active Columns` are shown in the table by default
- `Inactive Columns` are allowed for the table, but hidden by default

Users can later add inactive columns from column selection, but they do not start visible.

## Limit column visibility

This behavior is only used when `Limit column visibility?` is enabled in the table configuration drawer.

When the toggle is disabled:

- users can choose from all available columns
- the table uses a simpler active-columns configuration model

When the toggle is enabled:

- users can only choose from the board-defined active and inactive sets
- the owner manages those sets explicitly

## Owner behavior

Board owners manage limited visibility through separate `Active Columns` and `Inactive Columns` tabs.

The split is intentional:

- active columns define the default visible table
- inactive columns define optional columns that remain available to users

A column cannot exist in both groups at the same time. When a column is moved into the active set, it is removed from the inactive set automatically.

## Viewer behavior

For viewers, the feature is about controlled flexibility rather than full configuration freedom.

They:

- see the active columns by default
- can add from the inactive set when the table allows column selection
- cannot select arbitrary columns outside the allowed active/inactive pool while limited visibility is enabled

In non-owner view flows, the UI is simplified and does not expose the owner-oriented tabbed management interface.

## Empty inactive state

It is valid to enable limited visibility without choosing any inactive columns.

In that case:

- the active set still defines the default visible table
- there are no additional optional columns available for users to add later

## Why this exists

This feature gives board owners a middle ground between:

- exposing every possible column
- locking the table to a single fixed visible set

It supports curated table setups where the default view stays focused, but users still have access to a controlled set of extra columns.
