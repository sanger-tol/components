# `convertToPath`

Converts a given string `name` into a URL path format.

## Parameters

- `name`: A `string` representing the name or title you want to convert into a path.

## Returns

- A `string` that represents the converted path. This path:
  - Is always in lowercase.
  - Starts with a forward slash `/`.
  - Replaces all spaces with hyphens `-`.

## Example

```tsx
const title = "This is My Example";
const path = convertToPath(title);
console.log(path); // Output: "/this-is-my-example"
