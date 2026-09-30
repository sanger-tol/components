<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Data source operators

These operators let data sources share small capabilities without requiring them
to inherit from a common base class.

## Interfaces (Contract)

An operator interface defines a capability through a method signature. Classes
that provide that capability declare `implements` and supply the required
method; the interface itself is a compile-time contract and adds no runtime
behavior. For example, `ListGetter` and `PageGetter` specify list and paginated
list retrieval, and both `TsDataSource` and `SQLiteDataSource` implement them.

## Composed helper (Sharing functionality)

A composed operator is a separate object that a class uses to delegate a piece
of behavior. This keeps the behavior reusable without requiring inheritance.
For example, `DetailGetter` accepts a single-object getter and uses it to fetch
multiple IDs concurrently. `TsDataSource` composes it with its own `getOne`
method, then delegates `getByIds` to the helper.
