/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./scss/styling.scss";
import {
  API_PATHS,
  env,
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
  apiDataPath: API_PATHS.API_DATA_PATH,
  dataspace: env.QUASAR_DATASPACE,
  url: env.QUASAR_URL,
  apiPath: env.QUASAR_API_PATH,
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