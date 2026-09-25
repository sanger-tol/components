# App

## Navigation

`TNavConfig` has:

- `data`: map of `"Display Name" -> item`
- `order`: list of display names that controls what appears in the nav UI (and ordering)

An `item` is either:

- a page (leaf) with `path` (internal route or external link)
- a dropdown with `pages` (another `TNavConfig`)

Key rule: `order` is the source of truth for nav visibility (items not in `order` don’t render in the nav).

### Access

Applied per item (recursively):

- `public`: always
- `authenticated`: logged-in only
- `role_required`: logged-in + at least one role
- `string[]`: logged-in + has one of the listed roles

If a dropdown is inaccessible, the whole dropdown is removed.

### Notes

- Routes are only registered for leaf pages that have `path.route` (explicit or generated).
- Dropdown child routes are generated from the _child key_ (the key in `pages.data`), e.g. `"Public Dropdown Public Page"` → `"/public-dropdown-public-page"`.
- Query parameter values support route parameter placeholders using the `${parameterName}` syntax. Placeholders are resolved from matching route parameters before a board is rendered, including inside nested objects and arrays. Unresolved placeholders are left unchanged.

### Example

Example navigation configuration illustrating an example structure of TNavConfig.

```ts
const EXAMPLE: TNavConfig = {
  data: {
    "Dropdown Example 1": {
      access: "public",
      path: {
        route: "dropdown-path",
      },
      pages: {
        data: {
          "Page Example 2": {
            access: "public",
            path: {
              pageElementReference: "elementOne",
              route: "/page-example",
            },
          },
        },
        order: ["Page Example 2"],
      },
    },
    "Page Example 1": {
      access: "public",
      path: {
        pageElementReference: "boardId34",
        route: "page-example",
      },
    },
  },
  order: ["Dropdown Example 1", "Page Example 1"],
};
```

### Route parameters in query parameters

Store the query parameters as a `IFilter` in the database and use a route parameter placeholder when a board needs a detail value:

```json
{
  "access": "public",
  "path": {
    "pageElementReference": "b_123456",
    "route": "/species/:id",
    "queryParams": {
      "object_type": "species",
      "filter": {
        "and_": {
          "id": {
            "eq": {
              "value": "${id}"
            }
          }
        }
      }
    }
  }
}
```

Opening `/species/9606` resolves the filter value to `"9606"` before it is passed to the board. The route remains readable while the filter is still stored in the database as configuration.

Converters can be applied to all route parameter values before they are substituted. The `dashesToSpaces` converter allows a readable URL such as `/region/north-america` to resolve `${region_name}` to `"north america"`.
