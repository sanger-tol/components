/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactDOM from "react-dom";
import {
  Home,
  BarCharts,
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
  UserId,
  Messages,
  DashboardPage,
  NoAuthPageExample,
  AuthPageExample,
  MyBoards,
} from "./pages";
import reportWebVitals from "./reportWebVitals";
import { TolApp, Page, Dropdown } from "./tol-ui/src";
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

const widgets: Page = {
  name: "Widgets",
  element: <Widgets />,
};

// other
const detail: Page = {
  name: "Detail",
  element: <Detail />,
  detail: <DetailInfo />,
};

const dashboardPage: Page = {
  name: "Dashboard",
  element: <DashboardPage />,
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

const dataSource: Page = {
  name: "TsDataSource",
  element: <DataSource />,
};

const noAuthPage: Page = {
  name: "AuthPage",
  element: <NoAuthPageExample />,
  authElement: <AuthPageExample />,
};

const myBoards: Page = {
  name: "My Boards",
  element: <MyBoards />,
};

const dashboarding: Dropdown = {
  name: "Dashboarding",
  pages: [dashboardPage, myBoards],
};

const otherDropdown: Dropdown = {
  name: "Other",
  pages: [detail, forms, messages, miscellaneous, dataSource, noAuthPage],
};

// auth
const user: Page = {
  name: "User",
  element: <UserId />,
  auth: true,
};

// dev sandbox
const sandbox: Page = {
  name: "Sandbox",
  element: <Sandbox />,
  hidden: true,
};

ReactDOM.render(
  // eslint-disable-line
  <TolApp
    brand="Components"
    homePage={<Home />}
    pages={[
      barCharts,
      sunbursts,
      tables,
      filters,
      maps,
      timelines,
      widgets,
      dashboarding,
      otherDropdown,
      user,
      sandbox,
    ]}
    profileLinks={['/dashboarding/my-boards']}
    boardRouting={true}
  />,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
