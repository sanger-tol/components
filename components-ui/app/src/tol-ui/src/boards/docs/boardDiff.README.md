<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Board diff functionality

Board diff allows a board component to have a user-specific configuration without overwriting the published board configuration.

In practice, this is used when a user changes a component configuration outside board edit mode. Instead of updating the shared board component, the application stores a diff against the published config and renders that personalised version for the current user or session.

## Why this exists

Board edit mode changes the shared board for all viewers.

Outside edit mode, configuration changes should be personal:

- a logged-in user can customise a component for themselves
- a logged-out user can customise a component for the current browser session
- the published board configuration remains unchanged

This allows users to adjust things like table configuration without requiring board-owner edits to the shared layout.

## How it works

Every board component has a published `config`. A component may also have a `config_diff`, which represents a personalised override.

When a config change is saved:

- in edit mode, the shared component `config` is updated
- outside edit mode, a `config_diff` is created or updated instead

When a component is rendered outside edit mode, the UI prefers the personalised config if one exists. If no diff exists, it falls back to the published config.

## Persistence model

Board diff persistence depends on whether the user is authenticated.

For logged-in users:

- personalised config is stored remotely as an `entity_diff` record
- the diff is tied to the user and component
- subsequent saves update the same diff record

For logged-out users:

- personalised config is stored locally in browser storage
- the diff applies only to that anonymous browser/session context

This is why the UI warns that logged-in and logged-out table configuration is stored separately.

## Reset and cleanup behavior

If a personalised config becomes identical to the published config, the diff is treated as redundant and should be removed rather than kept.

Resetting a personalised config restores the published component behavior:

- logged-in users delete the remote diff entry
- logged-out users clear the local stored diff

After reset, the component falls back to the published `config`.

## Current usage in tables

The clearest current use of board diff is table configuration.

Outside edit mode, users can adjust table behavior such as:

- visible columns
- sort settings
- filter visibility
- page size

Those changes are applied as a personal variant rather than a shared board update. In edit mode, the same configuration UI updates the shared board config instead.
