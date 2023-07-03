/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import { Home, Charts, Miscellaneous, Tables, Forms } from "./pages";
//import { Sandbox } from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page } from "@tol/tol-ui"
import "./scss/styling.scss";


const charts: Page = {
  name: "Charts",
  authRequired: false,
  adminOnly: false,
  uiElement: <Charts />
}

const tables: Page = {
  name: "Tables",
  authRequired: false,
  adminOnly: false,
  uiElement: <Tables />
}

//const sandbox: Page = {
//  name: "Sandbox",
//  authRequired: false,
//  adminOnly: false,
//  uiElement: <Sandbox />
//}

const miscellaneous: Page = {
  name: "Miscellaneous",
  authRequired: false,
  adminOnly: false,
  uiElement: <Miscellaneous />
}

const forms: Page = {
  name: "Forms",
  authRequired: false,
  adminOnly: false,
  uiElement: <Forms />
}


ReactDOM.render(
  <TolApp
    brand="Components"
    homePage={ <Home /> }
    pages={[
      charts,
      tables,
      //sandbox,
      miscellaneous,
      forms
    ]}
    login={ true }
  />,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
