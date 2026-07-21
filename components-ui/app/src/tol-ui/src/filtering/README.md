# Filtering Overview

## Overview

This folder handles zone/component filtering and filter composition order.

```ts
{ and_: { [attribute]: { [operator]: { value?: any, negate?: boolean } } } }
```

## `filter` vs `defaultFilter` vs `subFilter`

- `filter`: the active filter currently applied.
- `defaultFilter`: the baseline filter used on reset and is a fall-back for non-self entries.
- `subFilter`: an additional derived filter layered on top of the active filter.
- `filterPassThrough`: when true, this entry isn't included in the generated filter downstream (except for self).

`defaultFilter` is runtime baseline behavior, not just initial UI state.

## How the filtering system works:

1. A filter set in a higher control is treated as an upstream constraint for controls below it.
2. Each lower control reads those upstream constraints before deciding what the user can edit/select.
3. Different input types react differently to keep filtering consistent.

What this means by input type:

- Text/number inputs: if upstream filters already constrain the same field, the input can be disabled so users cannot enter conflicting values.
- Multi-select inputs: the control stays usable, but the option list is filtered by upstream constraints, so users only see valid choices.
- Date range inputs: the control stays usable, but days outside upstream bounds are disabled in the calendar.

Examples:

- Text disable: if an upstream filter already fixes `country = UK`, a lower text filter for `country` may be disabled until that upstream filter changes.
- Multi-select filtering: if upstream filters narrow records to `region = Europe`, the lower multi-select options are fetched only from values available inside that region.
- Date restriction: if upstream filters imply `created_at >= 2024-01-01` and `< 2025-01-01`, the lower date picker disables dates outside that range.
