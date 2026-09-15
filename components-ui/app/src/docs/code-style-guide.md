# Code Style Guide

This document defines the architecture, naming conventions, file structure, and documentation rules for all frontend components and utilities.  
This includes code in `tol-ui`, as well as the UI of any of our apps.

## 1. File Structure:

* License
* Imports, in alphabetical order by package name, and in the order:
  * External libraries (e.g. react)
  * tol-ui symbols (imported from `“..”`)
  * tol-ui types (imported from `“..”` using `import type`)
* Providers
* Props Interface:
  * Named `P` + ComponentName
  * Always exported
  * Example: `PBoardTable`
* Functional Component:
  * Exported in the function declaration (NOT a default export)
  * Named in PascalCase (e.g. `BoardTable`)
  * Destructure necessary props and provide Defaults
    * `const { prop1, prop2, optionalProp = "default value" } = props`
  * Hooks. In order where possible:
    * `useContext`
    * `useState`
    * `useRef`
    * `useEffect`
  * Component wide variables (where possible as it depends on the variables dependencies)
  * Lambda Functions:
    * `() => {}`
    * If we have a function within a function use lambda functions for them
  * Configs:
    * Example: button config objects
  * Sub-components:
    * Anything returning visual
    * Always PascalCase
  * Return Statements:
    * (If applicable)
      * If error: return set screen
      * If warning: return set screen
      * If loading: return loading screen
    * Return Main block

## 2. Functions:

### Placement Rules:

* Put functions in the most appropriate utils.tsx file.  
* Any function used in multiple places → place in top-level utils file.
* All functions must include JSDoc docstrings with `@param` `@return` and `@example` where required.

### Function Types:

* Use promise chaining when dealing with promises and API calls
    * i.e. `someFunction().then().catch().finally()`.
    * Only use try/catch blocks when 100% necessary.

## 3. Interfaces & Types:

* Types should be imported separately from other symbols using `import type`.
* Main component props follow the following pattern:  
  `ComponentName` → `PComponentName`  
  Example: `RemoteTable` → `PRemoteTable`
* These props interfaces should always be exported.  
* All other interfaces
  * Must be placed in the `/interfaces` directory.
  * Should be prefixed with 'I' (e.g. `ITourStep`).
* Types
  * Must be placed in the `/types` directory.
  * Should be prefixed with 'T' (e.g. `TCellRenderer`)
* Each interface/type should go into a file that is closely linked to the feature or component.

## 4. Styling:

* Avoid inline styles where possible. If it only works as an inline style, be more specific and nest css classes.
  * You may have wanted to use a utility class instead like `.tol-mr-sm` (a small margin-right)
* Start all css classes with ‘.tol-’ in tol-ui. For individual apps, start with the app name (e.g. `.curation-download-container`)  
* Use predefined variables for colors where possible, i.e. text colour → `var(-–tol-text)`; These will automatically update based on users' light/dark mode preference and keep a consistent look across our ToL Platforms estate.

## 5. Constants:

* Constants should go into the `/constants` directory.  
* Each constant file should be closely related to the feature or component it supports.  
* Constant variable names must use ANGRY_SNAKE_CASE   
  Example: `THIS_IS_AN_EXAMPLE`
* Constant filenames should follow the pattern:  
  `name.constants.ts`  
  Example: `api.constants.ts`  
* Some constants are objects that we use instead of enums. For these:  
  * Declare them `as const` to narrow their type.  
  * To expose their type, define the type separately in `/interfaces`.
    Import the constant, then expose their values (e.g. `export type TConstant = (typeof CONSTANT)[keyof typeof CONSTANT]`)  
* When using types, use the most specific type possible. Never use `any`. (e.g. a state setter function should not be `(newValue: string) => void`, it should be `Dispatch<SetStateAction<string>>`)

## 6. Config:

* Config files should go into the `/config` directory.  
* Each config file must have a name closely related to the feature or component it configures.  
* All config variables must use ANGRY_SNAKE_CASE  
  Example: `THIS_IS_AN_EXAMPLE`  
* Config filenames should follow a descriptive camelCase pattern.  
  Example: `cellRendererParams.ts`

## 7. Naming Conventions:

* Anything that holds or directly returns a JSX element must be PascalCase (e.g., `ConfigButton`).  
* Test files should be named in pascal case, containing their area (+ ‘Utils’ if it’s testing a `utils.tsx` file), and ending with ‘.test.tsx’. (e.g. `AttributeUtils.test.tsx`) 

## 8. Accessibility (a11y)

* Prefer semantic elements. If this is infeasible due to styling, or there is no element that does this, use the `role` property
* Use ARIA tags where possible (e.g. `aria-describedby`)
  * There are some areas where RSuite expects these tags. e.g.:
  ```tsx
  <Modal aria-labelledby="modal-title">
    <h3 id="modal-title">Are you sure?</h3>
    <button>Yeah</button>
    <button>Nah</button>
  </Modal>
  ```
* Consider keyboard navigability when making custom elements

## 9. Most Misc Miscellaneous Miscellanea:

* End every statement with a semicolon  
* Code sections should be separated with exactly one new line  
* In JSX, prefer evaluating strings over using HTML entities (e.g. `{“<”}`, not `\&lt;`)

### Components

* **Rule:** Anything returning JSX → **PascalCase**  
* **File:** `PascalCase.tsx`  
* **Example:** `UserCard.tsx`, `function UserCard() { ... }`

### Props Interfaces

* **Prefix:** `P` + ComponentName  
* **Example:** `export interface PUserCard { name: string }`

### General Interfaces

* **Prefix:** `I`  
* **Stored in:** `/interfaces`  
* **File:** `Attribute.ts`  
* **Example:** `export interface ITable { rows: number }` → `table.interfaces.ts`

### Types

* **Prefix:** `T`  
* **Stored in:** `/interfaces`  
* **File:** `Attribute.ts`  
* **Example:** `export type TUserID = string | number` → `user.interfaces.ts`

### Constants

* **Case:** `ANGRY_SNAKE_CASE`  
* **Stored in:** `/constants`  
* **File name eg:** `camelCase.constants.ts`

### Configs

* **Case:** `ANGRY_SNAKE_CASE`  
* **Stored in:** `/config`  
* **File:** descriptive camelCase  
* **File name eg:** `cellRendererParams.ts`

### Functions

1. Standard functions → camelCase

* Example: `fetchData()`  
* Used for utilities and logic.

2. JSX-returning / sub-components → PascalCase

* Example: `ConfigButton()`  
* Used for React components or functions that return JSX.

### Variables

* **Local / state / helpers:** camelCase  
* **Example:** `const userName = 'Alice'`, `const [isOpen, setIsOpen] = useState<boolean>(false)`

### Documentation

* Keep docstrings on one line where possible.
* Use JSDoc for all utility functions and complex components.
* Ensure interfaces and types are documented appropriately.
* Keep examples and filenames aligned with the rules above for quick discoverability.
