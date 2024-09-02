# `normaliseCaps`

## Description

Transforms a given string to a more readable format by normalizing capitalization and replacing certain keywords or symbols. Specifically, it handles object identifiers (`id`, `uid`) by prefixing them with a normalized version of an optional endpoint name, and replaces periods in the string with underscores before splitting it into words and normalizing their capitalization.

## Props

- `name: string`: The string to be normalized.
- `endpoint?: string`: Optional. The endpoint name to prefix to object identifiers (`id`, `uid`).

## Usage

```tsx
import { normaliseCaps } from './Utils';

const normalizedName = normaliseCaps('user.id', 'account');
// Output: "Account ID"

const simpleName = normaliseCaps('first_name');
// Output: "First Name"
```

## Implementation

The function first checks if the `name` parameter is falsy, returning an empty string if true. If an `endpoint` is provided and the `name` matches `id` or `uid`, it prefixes the normalized `endpoint` name to "ID". It then replaces any periods (`.`) in the name with underscores (`_`) and splits the resulting string into words based on underscores. Each word is then normalized for capitalization (handled by the `normaliseWords` function, not shown here) and joined back into a single string with spaces.
