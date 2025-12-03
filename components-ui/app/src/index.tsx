/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createRoot } from "react-dom/client";
import {
  Home,
  Sandbox,
  CodeStyle
} from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page, Dropdown } from "./tol-ui/src";
import { generateAutoDocPages } from "./auto-doc";
import "./scss/styling.scss";


const codeStyle: Page = {
  name: "Code Style Guide",
  element: <CodeStyle />
}

// dev sandbox - change element if needed
const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true,
};

const developerDropdown: Dropdown = {
  name: "Developer",
  pages: [codeStyle],
};

const autoDocPages = generateAutoDocPages();

const root = createRoot(document.getElementById('root')!);
root.render(
  <TolApp
    brand="Components"
    homePage={<Home />}
    pages={[
      sandbox,
      developerDropdown,
      ...autoDocPages,
    ]}
  />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();