<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Changelog

## tol-ui `3.4.5`
20-04-2026
- Added personal table configuration reset controls and clearer messages for published versus user-specific table configs.
- Fixed board table config saves so user-specific `board_diff` changes are applied immediately after saving.
- Added notices explaining that logged-in and logged-out table configuration changes are stored separately.

## tol-ui `3.4.4`
10-04-2026
- Fixed bug: NormaliseCaps only replacing the first period in a system name
- Fixed bug: Link renderer's display value defaulting to `value` even when of type object (TOLP-9731)
- Fixed bug: Image renderer - cannot click on whole image to open modal
- Fixed bug: Advanced search removing all selected fields (TOLP-9702)

## tol-ui `3.4.3`
08-04-2026
- Fixed bug: Fixed MVP table actions. It now uses props.dataObject.'attribute' instead of props.value
- Fixed bug: Dark mode key bug on map tooltips
- Fixed bug: Amalgamate requested fields race condition
- Fixed bug: `Undefined` filter causing 500 on group stats endpoint

## tol-ui `3.4.2`
07-04-2026
- Fixed bug: FilterConfigDrawer deals with undefined filters

## tol-ui `3.4.1`
07-04-2026
- Fixed bug: components not loading when no filter is passed to a zone (TOLP-9700)
- Updated map overlay styling for dark mode

## tol-ui `3.4.0`
02-04-2026
- Multi-select filter options are now filterable (TOLP-8099)
- `generateFilter` now reverts to the defaultFilter if no other filters are present (at a attribute and operator level)

## tol-ui `3.3.0`
26-03-2026

- `More` & `Unknown` sections of the Sunburst visualisation are now clickable (TOLP-7103)
- Deal with the 0 vs null/undefined DataPoint issue (TOLP-9664)
- Removed max-width for content on SmartApp
- Date picker for dates on editable cells (TOLP-9645)

## tol-ui `3.2.3`
26-03-2026

- Added changelog file to track tol-ui version updates and changes
