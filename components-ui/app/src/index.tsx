/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import { Home, BarCharts, Miscellaneous, Tables, Forms, Maps, Sunbursts } from "./pages";
// import { Sandbox } from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page } from './tol-ui/src'
import "./scss/styling.scss";


const barCharts: Page = {
  name: "BarCharts",
  authRequired: false,
  adminOnly: false,
  uiElement: <BarCharts />
}

const forms: Page = {
  name: "Forms",
  authRequired: false,
  adminOnly: false,
  uiElement: <Forms />
}

const maps: Page = {
  name: "Maps",
  authRequired: false,
  adminOnly: false,
  uiElement: <Maps />
}

const miscellaneous: Page = {
  name: "Miscellaneous",
  authRequired: false,
  adminOnly: false,
  uiElement: <Miscellaneous />
}

const tables: Page = {
  name: "Tables",
  authRequired: false,
  adminOnly: false,
  uiElement: <Tables />
}

const sunbursts: Page = {
  name: "Sunbursts",
  authRequired: false,
  adminOnly: false,
  uiElement: <Sunbursts />
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
      barCharts,
      forms,
      maps,
      miscellaneous,
      tables,
      sunbursts
    ]}
    login={ false }
  />,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
