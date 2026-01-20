# How to Document ToLP UI Code

This document describes the standard approach for documenting ToLP UI code.
It outlines conventions for documenting components, utility functions, and
larger architectural implementations to ensure consistency and clarity.

---

### Components

Components adhere to a TSDoc-like system. The syntax is as follows, in this order:

1. Use `@autodoc` above the props interface to display the documentation on the component’s web app as a page.
2. Provide a description of the component.
3. Inside the props interface, add a description of each prop before its definition.
    - For frequently used props, create a new interface to inherit from that also includes the relevant descriptions.

Example:
```
/**
 * @autodoc
 * BoardTable is a thin wrapper around RemoteTable that handles
 * the saving and updating of table configuration for use in a board.
 */
export interface PBoardTable extends PVisualisation {
  /** The database configuration save for a table */
  config: ITableConfigSave;
}
```

---

### Utility Functions

Use the TSDoc standard for functions. Keep these simple to reduce clutter.

1. A description of what the function does.
2. `@param` keyword, followed by the parameter name and its description.
3. `@returns` keyword, followed by a description of what is returned.

Example:
```
/**
 * A hook that allows a fallback state to be used if an external state is not provided.
 * @param externalState The external state to use, if provided.
 * @param externalSetState The external setState function to use, if provided.
 * @param defaultValue The default value to use if no external state is provided.
 * @returns A tuple containing the state and setState function.
 */
export function useStateFallback...
```

---

### “Low-Level” Implementation READMEs

Provide detailed explanations of how a larger piece of code works architecturally. This section will link to an example soon.
