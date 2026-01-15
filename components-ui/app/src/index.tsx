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
import {
  TolApp,
  Page,
  Dropdown,
  TsDataSource,
  env,
  LOCAL_API_DATA_PATH,
  generateAutoDocPages,
} from "./tol-ui/src";
import reportWebVitals from "./reportWebVitals";
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

const docsDropdown: Dropdown = {
  name: "Docs",
  pages: generateAutoDocPages(),
};

const boardDataSource = new TsDataSource({
  apiPath: env.API_PATH,
  apiDataPath: LOCAL_API_DATA_PATH,
})

const root = createRoot(document.getElementById('root')!);
root.render(
  <TolApp
    boards={{boardDataSource}}
    brand="Components"
    homePage={<Home />}
    pages={[
      sandbox,
      developerDropdown,
      docsDropdown,
    ]}
  />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();