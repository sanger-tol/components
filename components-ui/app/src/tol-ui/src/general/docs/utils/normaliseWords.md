# `normaliseWords`

## Description

Converts specific abbreviations or identifiers into their fully capitalized forms or proper case formats. It's designed to handle common abbreviations and identifiers used in a specific domain, ensuring consistency in naming conventions across the application.

## Props

- `word: string`: The word or abbreviation to be normalized.

## Usage

```tsx
import { normaliseWords } from './Utils';

console.log(normaliseWords('uid')); // Output: "ID"
console.log(normaliseWords('tolqc')); // Output: "ToLQC"
console.log(normaliseWords('api')); // Output: "API"
console.log(normaliseWords('sampletext')); // Output: "Sampletext"
```

## Implementation

The function uses a `switch` statement to match the input `word` against a predefined list of cases. Each case corresponds to a specific abbreviation or identifier, and the function returns the normalized, often fully capitalized, version of that abbreviation. If the input `word` does not match any of the predefined cases, the function defaults to capitalizing the first letter of the word, leaving the rest of the word unchanged. This approach ensures that even words not explicitly handled by the function are returned in a consistent format.
