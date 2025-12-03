# Code Style Guide

This document defines the architecture, naming conventions, file structure, and documentation rules for all frontend components and utilities.

## 1. File Structure
- License
- Imports
- Providers
- Props Interface:
    - Prefixed with `P` + `ComponentName`
    - Always exported
    - Example: `PBoardTable`
- Functional Component:
    - Named in PascalCase (e.g., `BoardTable`)
    - Destructure necessary Props + provide defaults
    - Hooks examples: `useContext`, `useState`, `useEffect`, `useRef`, `etc`
- Lambda Functions:
    - Use `() => {}`
    - If we have a function within a function, use lambda functions for them
- Configs:
    - Example: `button config objects`
- Sub-components:
    - Anything returning visual JSX
    - Always PascalCase
- Return Statements (if applicable):
    - If error: return set screen
    - If warning: return set screen
    - If loading: return loading screen
    - Return main block

## 2. Functions
- Placement Rules:
    - Put functions in the most appropriate `utils.tsx` file.
    - Any function used in multiple places → place in top-level `utils` file.
- Documentation:
    - All functions must include JSDoc docstrings.

## 3. Interfaces & Types
- Main component props follow the pattern:
    - `ComponentName` → `PComponentName`
    - Example: `RemoteTable` → `PRemoteTable`
    - These props interfaces should always be exported.
- All other interfaces and types:
    - Must be placed in the `/interfaces` directory.
    - Each interface/type should go into a file closely linked to the feature or component.
    - Interfaces are prefixed with `I`.
    - Types are prefixed with `T`.

## 4. Constants
- Location: `/constants` directory.
- Each constant file should be closely related to the feature or component it supports.
- Constant variable names must use ANGRY_SNAKE_CASE.
    - Example: `THIS_IS_AN_EXAMPLE`
- Constant filenames follow the pattern: 
    - `name.constants.ts`
    - Example: `api.constants.ts`

## 5. Config
- Location: `/config` directory.
- Each config file must have a name closely related to the feature or component it configures.
- All config variables must use ANGRY_SNAKE_CASE.
    - Example: `THIS_IS_AN_EXAMPLE`
- Config filenames use a descriptive camelCase pattern.
    - Example: `cellRendererParams.ts`

## 6. Naming Conventions
- Rule: Anything that directly returns a JSX element must be PascalCase (e.g., `ConfigButton`).

### Components
- Anything returning JSX → PascalCase
- File: `PascalCase.tsx`
- Example: `UserCard.tsx`, `function UserCard() { ... }`

### Props Interfaces
- Prefix: `P` + `ComponentName`
- Example: `export interface PUserCard { name: string }`

### General Interfaces
- Prefix: `I`
- Stored in: `/interfaces`
- File: closely related to the entity (e.g., `table.interfaces.ts`)
- Example: `export interface ITable { rows: number }`

### Types
- Prefix: `T`
- Stored in: `/interfaces`
- File: closely related to the entity (e.g., `user.interfaces.ts`)
- Example: `export type TUserID = string | number`

### Constants
- Case: ANGRY_SNAKE_CASE
- Stored in: `/constants`
- Filename: `camelCase.constants.ts`
- Example: `api.constants.ts`

### Configs
- Case: ANGRY_SNAKE_CASE
- Stored in: `/config`
- Filename: `descriptive camelCase`
- Example: `cellRendererParams.ts`

### Functions
1. Standard functions → camelCase
     - Example: `fetchData()`
     - Used for utilities and logic.
2. JSX-returning / sub-components → PascalCase
     - Example: `ConfigButton()`
     - Used for React components or functions that return JSX.

### Variables
- Local / state / helpers: camelCase
- Examples:
    - `const userName = 'Alice'`
    - `const [isOpen, setIsOpen] = useState(false)`


## Documentation
- Use JSDoc for all utility functions and complex components.
- Keep examples and filenames aligned with the rules above for quick discoverability.




