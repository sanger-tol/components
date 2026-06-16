<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Changelog

## tol-ui `3.5.7`

12-06-2026

- Added the DOWNLOAD button type
- Added the `cleanable` and `searchable` SingleSelect options

## tol-ui `3.5.6`

28-05-2026

- Added configurable tours commenced by `processTour` (including the first tour for adding a zone)

## tol-ui `3.5.5`

21-04-2026

- Added Priority cell renderer
- Fixed bug: Table download - columns with duplicate display names are silently overwritten

## tol-ui `3.5.4`

30-04-2026

- Allow for DataPointRenderers to access current and parent data objects
- Link DataPointRenderer now requires a `Text` parameter

## tol-ui `3.5.3`

29-04-2026

- Fixed bug: Sort aggregation labels for Bar Charts.

## tol-ui `3.5.2`

27-04-2026

- The TitleTooltip on utility bars for zones and components on boards now show the ID of said
  zone or component.

## tol-ui `3.5.1`

21-04-2026

- Added JsonEdit component
- Removed the need to be in edit mode to change page sizes on tables
- Added actionDataSource to change how actions are fetched
- Added the option to use the new :aggregations endpoint. The previous endpoint by this name has been renamed to :aggregations_legacy.
  Bar charts now use the new endpoint, but sunbursts remain on the old on

## tol-ui `3.5.0`

20-04-2026

- Adding actions to BoardTables using role and action tables

## tol-ui `3.4.5`

16-04-2026

- Adding editable cells to Board Table (TOLP-9715)
- Fixed status editing to work with the backend on :action endpoint

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
