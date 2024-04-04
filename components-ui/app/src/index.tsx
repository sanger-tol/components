/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from 'react-dom';
import { Home,
  BarCharts,
  Combo,
  Detail,
  DetailInfo,
  Miscellaneous,
  Tables,
  Forms,
  Maps,
  Sandbox,
  Sunbursts,
  Widgets,
  UserId } from "./pages";
// import { Sandbox } from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page, Dropdown } from './tol-ui/src';
import "./scss/styling.scss";


const barCharts: Page = {
  name: "BarCharts",
  element: <BarCharts />
};

const combo: Page = {
  name: "Combo",
  element: <Combo />
};

const forms: Page = {
  name: "Forms",
  element: <Forms />,
  hidden: true
};

const maps: Page = {
  name: "Maps",
  element: <Maps />
};

const miscellaneous: Page = {
  name: "Miscellaneous",
  element: <Miscellaneous />,
  hidden: true
};

const tables: Page = {
  name: "Tables",
  element: <Tables />
};

const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true
};

const sunbursts: Page = {
  name: "Sunbursts",
  element: <Sunbursts />,
  hidden: true
};

const widgets: Page = {
  name: "Widgets",
  element: <Widgets />,
  hidden: true
};

const detail: Page = {
  name: "Detail",
  element: <Detail />,
  detail: <DetailInfo/>
};

const userId: Page = {
  name: 'UserId',
  auth: true,
  element: <UserId />
};

const dropdown: Dropdown = {
  name: 'Dropdown',
  pages: [widgets, sunbursts],
  //auth: true,
  //admin: true
};

ReactDOM.render( // eslint-disable-line
  <TolApp
    brand="Components"
    homePage={ <Home /> }
    pages={[
      dropdown,
      barCharts,
      combo,
      forms,
      maps,
      miscellaneous,
      tables,
      sandbox,
      sunbursts,
      widgets,
      detail,
      userId
    ]}
  />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();