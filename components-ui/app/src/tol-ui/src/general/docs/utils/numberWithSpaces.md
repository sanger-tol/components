# `numberWithSpaces`

## Description

Converts a number into a string format with spaces separating every three digits, typically used for formatting numbers for better readability.

## Props

- `num: number`: The number to be formatted.

## Usage

```tsx
import { numberWithSpaces } from './Utils';

const formattedNumber = numberWithSpaces(1234567);
console.log(formattedNumber); // Output: "1 234 567"
```

## Implementation

The function takes a numeric input and converts it to a string using the `toString()` method. It then uses a regular expression in conjunction with the `replace()` method to insert spaces at every third digit from the right, except before the first digit. This is achieved by looking for positions within the string that are followed by a multiple of three digits, using a positive lookahead assertion that does not consume any characters `((?=(\d{3})+(?!\d)))`. The `\B` assertion at the start ensures that the match does not occur at the beginning of the string, allowing for the correct placement of spaces.
