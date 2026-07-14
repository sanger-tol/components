# Zone Filter Translation (Currently only 1 hop relationships)

Filter translation keeps user intent consistent when moving between zones with different object types.

Example: a user filters by `species.name`, then moves to a `specimen` zone. The filter key may need rewriting, but the meaning should stay the same.

## Translation Cases

### 1. From one side to many side

If the incoming field is a plain attribute like `name`, and the current zone has a path to the above zone's object type, we prepend the correct relationship path.

Example: if the above zone is `species` and the current zone is `specimen`, `name` becomes `species.name`.

### 2. From many side to one side

If the incoming field already has a relationship prefix (for example `species.name`), the data source finds which object type that prefix refers to.

Example direction: `specimen` to `species` is many side to one side.

- If it matches the current zone object type: remove the prefix (`species.name` becomes `name`).
- If it does not match: swap to the current zone's path (`oldRelationship.name` -> `newRelationship.name`).

## Guardrails

Translation only happens when metadata confirms it is safe:

- Attribute is allowed on relationships (`available_on_relationships`)
- Relationship paths exist

If not, the field is skipped to avoid invalid filtering.
