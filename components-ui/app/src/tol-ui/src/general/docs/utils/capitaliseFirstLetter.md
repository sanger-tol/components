# `capitaliseFirstLetter`

## Description

Transforms the first letter of a given string to uppercase while leaving the rest of the string unchanged. This function is useful for formatting text that needs to start with a capital letter, such as names or titles.

## Props

- `string: string`: The string whose first letter will be capitalized.

## Usage

```tsx
import { capitaliseFirstLetter } from './Utils';

const exampleString = 'example';
const formattedString = capitaliseFirstLetter(exampleString);

console.log(formattedString); // Output: 'Example'
```

## Implementation

The function works by:

1. Accessing the first character of the input string using charAt(0) and converting it to uppercase.
2. Slicing the rest of the string starting from the second character using slice(1).
3. Concatenating the uppercase first character with the rest of the string.

This approach ensures that only the first letter is modified, regardless of the original casing of the input string.
