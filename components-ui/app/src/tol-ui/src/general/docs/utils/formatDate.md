# `formatDate`

Converts a string representation of a date and time into a formatted string.

## Parameters

- `text`: A `string` representing the date and time to be formatted. The string should be in a format that can be recognized by the `Date` constructor.

## Returns

- A `string` representing the formatted date and time in the format `dd/MM/yyyy HH:mm`. If the input string cannot be converted into a valid date, the original input string is returned.

## Example

```tsx
import { formatDate } from './Utils';

const dateTimeString = "2023-01-01T12:00:00Z";
const formattedDate = formatDate(dateTimeString);
console.log(formattedDate); // Output: "01/01/2023 12:00"
