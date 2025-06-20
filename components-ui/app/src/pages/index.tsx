/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, env } from "../tol-ui/src";

export const tolDataSource = new TsDataSource({
  baseUrl: env.TOL_DATA,
});

export * from "./Home";
export * from "./Tables";
export * from "./Sandbox";
export * from "./Miscellaneous";
export * from "./Filters";
export * from "./Forms";
export * from "./BarCharts";
export * from "./Maps";
export * from "./Sunbursts";
export * from "./Widgets";
export * from "./Detail";
export * from "./DetailInfo";
export * from "./UserId";
export * from "./Timelines";
export * from "./Messages";
export * from "./AuthPageExample";
export * from "./NoAuthPageExample";
export * from "./Colours";
export * from "./Factories";
export * from "./DataSource";
