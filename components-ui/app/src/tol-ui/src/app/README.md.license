
# App
### Navigation

`TNavConfig` has:
- `data`: map of `"Display Name" -> item`
- `order`: list of display names that controls what appears in the nav UI (and ordering)

An `item` is either:
- a page (leaf) with `path` (internal route or external link)
- a dropdown with `pages` (another `TNavConfig`)

Key rule: `order` is the source of truth for nav visibility (items not in `order` don’t render in the nav).

##### Access

Applied per item (recursively):
- `public`: always
- `authenticated`: logged-in only
- `role_required`: logged-in + at least one role
- `string[]`: logged-in + has one of the listed roles

If a dropdown is inaccessible, the whole dropdown is removed.

##### Notes

- Routes are only registered for leaf pages that have `path.route` (explicit or generated).
- Dropdown child routes are generated from the *child key* (the key in `pages.data`), e.g. `"Public Dropdown Public Page"` → `"/public-dropdown-public-page"`.
