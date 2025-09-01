/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Direct package pass-throughs
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Form,
  Spinner,
} from "react-bootstrap";
export { Container, Row, Col, Form, ButtonGroup, Spinner as Loader };
import { useToaster as Toaster, Form as RSForm } from "rsuite";
export { Toaster, RSForm };

// FontAwesome icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
// Add icons to the library
library.add(fas);

export * from "./boards";
export * from "./charts";
export * from "./config";
export * from "./constants";
export * from "./contexts";
export * from "./datasource";
export * from "./factories";
export * from "./filtering";
export * from "./forms";
export * from "./general";
export * from "./hooks";
export * from "./map";
export * from "./messaging";
export * from "./interfaces";
export * from "./nav";
export * from "./services";
export { retry } from "./services/http";
export * from "./smart-app";
export * from "./table";
export * from "./timeline";
export * from "./variables";
export * from "./file-validation";

import { TsDataSource, env } from ".";
export const TOL_DS = new TsDataSource({
  baseUrl: env.TOL_DATA,
});
