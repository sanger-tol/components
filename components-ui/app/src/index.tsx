/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./scss/styling.scss";
import {
  API_PATHS,
  generateAutoDocNavigation,
  SmartApp,
  TsDataSource
} from "./tol-ui/src";
import {
  Home,
  Sandbox,
  MarkdownDocumentation,
} from "./pages";
import codeStyleGuideContent from "./docs/code-style-guide.md?raw";
import howToDocumentContent from "./docs/how-to-document.md?raw";


const {
  pageElements: autoDocPageElements,
  navConfig: autoDocNavConfig
} = generateAutoDocNavigation();

const pageElements = {
  home: <Home />,
  sandbox: <Sandbox />,
  codeStyleGuide: <MarkdownDocumentation content={codeStyleGuideContent} />,
  howToDocument: <MarkdownDocumentation content={howToDocumentContent} />,
  ...autoDocPageElements,
};

const CONFIG_DS = new TsDataSource({
  apiPath: API_PATHS.API_PATH,
  apiDataPath: API_PATHS.BOARDS,
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <SmartApp
    id="components"
    configurableBoards
    brand="Components"
    pageElements={pageElements}
    configDataSource={CONFIG_DS}
/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();