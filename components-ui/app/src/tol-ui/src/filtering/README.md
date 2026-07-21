# Filtering on the UI

## Overview

This folder handles zone/component filtering and filter composition order.

```ts
{ and_: { [attribute]: { [operator]: { value?: any, negate?: boolean } } } }
```

## How the filtering system works:

1. Filters trickle throughout a Zone. This can be expanded on to a whole Board with translators.
2. A filter set in a higher entity is treated as an upstream constraint for controls below it.
3. Each lower control reads those upstream constraints before deciding what the user can edit/select.

#### When is a filter disabled or restricted?

- If a filter is saved against the component you are looking at, it will act as a pre-filled filter that can be removed by the user.
- If a filter is saved above the component you are looking at, it will have restricted capabilities. These can vary depending on the input type. See below.

#### What this means by input type:

- Text/number inputs: if upstream filters already constrain the same field, the input can be disabled so users cannot enter conflicting values.
- Multi-select inputs: the control stays usable, but the option list is filtered by upstream constraints, so users only see valid choices.
- Date range inputs: the control stays usable, but days outside upstream bounds are disabled in the calendar.

#### Operator toggles
- Exists: toggling this will remove an inputted value filter. They cannot coexist.
- Negate: you can only toggle this once a filter has been added. You cannot negate 'nothing'.

## Behind the scenes

- `filter`: the active filter currently applied.
- `defaultFilter`: the baseline filter used on reset and is a fall-back for non-self entries.
- `subFilter`: an additional filter layered on top of the original filter. For example, the sunburst component uses it for the sub-sunburst.
- `filterPassThrough`: when true, this entry isn't included in the generated filter downstream (except for self).

Note: `defaultFilter` is runtime baseline behavior, not just initial UI state.
