/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import { Home, Tables } from "./pages";
// import { Sandbox } from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page } from "@tol/tol-ui"
import "./scss/styling.scss";

const tables: Page = {
  name: "Tables",
  authRequired: false,
  adminOnly: false,
  uiElement: <Tables />
}

/*
const sandbox: Page = {
  name: "Sandbox",
  authRequired: false,
  adminOnly: false,
  uiElement: <Sandbox />
}
*/

ReactDOM.render(
  <TolApp
    brand="Components"
    homePage={ <Home /> }
    pages={[
      tables,
      // sandbox
    ]}
    login={ true }
  />,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
