# How To Document ToLP UI code

DESCRIPTION HERE

---

### Components
Components adhere to a tsdoc like system. The syntax is the following and in order:
1. Use `@autodoc` above the props interface to display the documentation on the Component's webapp as a page.
2. A description of the component.
3. Inside the props interface add a description of each prop before its definition.
    - For frequently used props you should create a new interface to inherit from, that also has the relevant description.

Example: 
```
/**
 * @autodoc
 * BoardTable is a thin wrapper around RemoteTable that handles
 * the saving and updating of table configuration for use in a board.
 */
export interface PBoardTable extends PVisualisation {
  /** The database configuration save of a table */
  config: ITableConfigSave;
}
```
---

### Utils Functions
Use the tsdoc standard for functions. Keep these simple to reduce clutter.
1. Description of what the function does.
2. `@param` keyword, paramName and then description.
3. `@returns` keyword, followed by a description of what is returned.

Example:
```
/**
 * A hook that allows for a fallback state to be used if an external state is not provided.
 * @param externalState The external state to use if provided.
 * @param externalSetState The external setState function to use if provided.
 * @param defaultValue The default value to use if no external state is provided.
 * @returns A tuple containing the state and setState function.
 */
 export function useStateFallback...
```
---

### 'Low Level' Implementation READMEs
Provide detailed explanations of how a larger piece of code works architecturally. This will link to an example soon.