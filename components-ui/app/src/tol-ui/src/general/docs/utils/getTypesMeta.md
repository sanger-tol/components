# `getTypesMeta`

## Description

Fetches and caches type metadata, including attributes and relationships, from a given base URL. It uses local storage to cache the data for an hour to minimize network requests. If the data is expired or not present, it fetches the data again.

## Props

- `baseUrl?: string`: Optional. The base URL to fetch the metadata from. If not provided, a default value is used.
- `attributeMetadataUrl?: string`: Optional. The specific URL to fetch attribute metadata from. If not provided, a default endpoint is used.
- `relationshipsUrl?: string`: Optional. The specific URL to fetch relationship metadata from. If not provided, a default endpoint is used.

## Usage

```tsx
import { getTypesMeta } from './Utils';

async function fetchMetadata() {
  const typesMeta = await getTypesMeta(
    'https://example.com/api',
    'https://example.com/api/attributes',
    'https://example.com/api/relationships'
  );
  console.log(typesMeta);
}

fetchMetadata();
```

## Implementation

The function first checks if there is a pending promise for the given `baseUrl`. If not, it creates a new promise that:

1. Checks local storage for cached metadata using a key constructed from the `baseUrl`.
2. If the cached data is found but expired, or not found at all, it fetches the attribute and relationship metadata from the provided URLs or default endpoints.
3. The fetched data is then cached in local storage with an expiry time set to one hour from the fetch time.
4. Finally, the promise is resolved with the fetched (or cached if still valid) metadata.

The function ensures that concurrent requests for the same `baseUrl` do not trigger multiple network requests by caching the promise and only allowing one active fetch operation per `baseUrl`.
