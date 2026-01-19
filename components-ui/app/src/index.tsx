/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./scss/styling.scss";
import {
  TolApp,
  Page,
  Dropdown,
  TsDataSource,
  env,
  LOCAL_API_DATA_PATH,
  generateAutoDocPages,
} from "./tol-ui/src";
import {
  Home,
  Sandbox,
  MarkdownDocumentation,
} from "./pages";
import codeStyleGuideContent from "./docs/code-style-guide.md?raw";
import howToDocumentContent from "./docs/how-to-document.md?raw";


const codeStyleGuide: Page = {
  name: "Code Style Guide",
  element: <MarkdownDocumentation content={codeStyleGuideContent} />
}

const howToDocument: Page = {
  name: "How To Document",
  element: <MarkdownDocumentation content={howToDocumentContent} />
}

const developerDropdown: Dropdown = {
  name: "Developer",
  pages: [codeStyleGuide, howToDocument],
};

const docsDropdown: Dropdown = {
  name: "Docs",
  pages: generateAutoDocPages(),
};

const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true,
};

const boardDataSource = new TsDataSource({
  apiPath: env.API_PATH,
  apiDataPath: LOCAL_API_DATA_PATH,
});

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