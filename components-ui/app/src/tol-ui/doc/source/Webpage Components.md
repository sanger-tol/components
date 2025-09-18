SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT

# Webpage Components

This document explains practices used in React components to be used as webpages.

## The `Widgets` component

`Widgets` is the fundamental component used to structure a page in tol-ui. When crafting a React component for a webpage, this is the component that you should return.

The `Widgets` component takes a single prop: `components`. This is an array of objects, each of which have the `component` and `type` properties. Each of these objects represents a "section" of the webpage.

The `type` property controls the size of the widget (`"full"`, `"sm"`, `"md"`, `"lg"`, `"xl"`).

The `component` property is the JSX element that will be placed inside the widget container.

### Example

```tsx
import { Widgets } from "@tol/tol-ui";

function Component() {
  const title = <h2>Page Title</h2>;
  const content = <p>Page Content</p>;

  const components = [
    {
      component: title,
      type: "full"
    },
    {
      component: content,
      type: "full"
    }
  ];

  return <Widgets components={components} />
}

export default Component;
```
