/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createRoot } from "react-dom/client";
import {
  Home,
  BarCharts,
  Colours,
  DataSource,
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
  Factories,
} from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page, Dropdown, TOL_DS } from "./tol-ui/src";
import "./scss/styling.scss";

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

const portal: Page = {
  name: "Portal",
  link: {
    href: "https://portal.tol.sanger.ac.uk",
    target: "_blank",
  },
}

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

const factories: Page = {
  name: "Factories",
  element: <Factories />
}

const visualisationsDropdown: Dropdown = {
  name: "Visualisations",
  pages: [barCharts, filters, maps, sunbursts, tables, timelines],
};

const otherDropdown: Dropdown = {
  name: "Other",
  pages: [colours, detail, factories, forms, messages, miscellaneous, tsds, widgets, portal],
};

// dev sandbox - change element if needed
const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true,
};


const root = createRoot(document.getElementById('root')!);
root.render(
  <TolApp
    boards={{dataSource: TOL_DS}}
    brand="Components"
    homePage={<Home />}
    pages={[
      visualisationsDropdown,
      otherDropdown,
      sandbox,
    ]}
  />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
