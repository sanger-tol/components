/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import {
  Home,
  BarCharts,
  Colours,
  Detail,
  DetailInfo,
  Filters,
  Forms,
  Miscellaneous,
  Maps,
  Tables,
  Timelines,
  Sandbox,
  Sunbursts,
  Widgets,
  Messages,
} from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page, Dropdown, env } from "./tol-ui/src";
import "./scss/styling.scss";
import DataSource from "./pages/DataSource";

// main data-driven components
const barCharts: Page = {
  name: "BarCharts",
  element: <BarCharts />,
};

const sunbursts: Page = {
  name: "Sunbursts",
  element: <Sunbursts />,
};

const tables: Page = {
  name: "Tables",
  element: <Tables />,
};

const filters: Page = {
  name: "Filters",
  element: <Filters />,
};

const maps: Page = {
  name: "Maps",
  element: <Maps />,
};

const timelines: Page = {
  name: "Timelines",
  element: <Timelines />,
};

// other
const colours: Page = {
  name: "Colours",
  element: <Colours />,
};

const detail: Page = {
  name: "Detail",
  element: <Detail />,
  detail: <DetailInfo />,
};

const forms: Page = {
  name: "Forms",
  element: <Forms />,
};

const messages: Page = {
  name: "Messages",
  element: <Messages />,
};

const miscellaneous: Page = {
  name: "Miscellaneous",
  element: <Miscellaneous />,
};

const tsds: Page = {
  name: "TsDataSource",
  element: <DataSource />,
};

const widgets: Page = {
  name: "Widgets",
  element: <Widgets />,
};

const otherDropdown: Dropdown = {
  name: "Other",
  pages: [colours, detail, forms, messages, miscellaneous, tsds, widgets],
};

// dev sandbox - change element if needed
const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true,
};

ReactDOM.render(
  // eslint-disable-line
  <TolApp
    boards={{ dataUrl: env.API_PATH }}
    brand="Components"
    homePage={<Home />}
    pages={[
      barCharts,
      sunbursts,
      tables,
      filters,
      maps,
      timelines,
      otherDropdown,
      sandbox,
    ]}
  />,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
