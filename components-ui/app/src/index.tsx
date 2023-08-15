/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import { Home,
         BarCharts,
         Miscellaneous,
         Tables,
         Forms,
         Maps,
         Sandbox,
         Sunbursts } from "./pages";
// import { Sandbox } from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page } from './tol-ui/src'
import "./scss/styling.scss";


const barCharts: Page = {
  name: "BarCharts",
  uiElement: <BarCharts />
}

const forms: Page = {
  name: "Forms",
  uiElement: <Forms />
}

const maps: Page = {
  name: "Maps",
  uiElement: <Maps />
}

const miscellaneous: Page = {
  name: "Miscellaneous",
  uiElement: <Miscellaneous />
}

const tables: Page = {
  name: "Tables",
  uiElement: <Tables />
}

const sunbursts: Page = {
  name: "Sunbursts",
  uiElement: <Sunbursts />
}

const sandbox: Page = {
  name: "Sandbox",
  uiElement: <Sandbox />,
  hidden: true
}

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
      sandbox,
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
