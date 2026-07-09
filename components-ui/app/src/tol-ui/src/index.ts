/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Direct package pass-throughs
import { TsDataSource, env, API_PATHS } from ".";
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
import { fab } from "@fortawesome/free-brands-svg-icons";
// Add icons to the library
library.add(fas, fab);

export * from "./app";
export * from "./attributes";
export * from "./autodoc";
export * from "./boards";
export * from "./buttons";
export * from "./charts";
export * from "./config";
export * from "./constants";
export * from "./contexts";
export * from "./datasource";
export * from "./download"
export * from "./factories";
export * from "./file-validation";
export * from "./filtering";
export * from "./forms";
export * from "./general";
export * from "./hooks";
export * from "./map";
export * from "./messaging";
export * from "./interfaces";
export * from "./overlays";
export * from "./services";
export { retry } from "./services/http";
export { clearExpiredToken } from "./services/auth";
export * from "./table";
export * from "./tours";
export * from "./timeline";
export * from "./utility-bar";
export * from "./variables";
export * from "./images";
export * from "./json-editor";
export * from "./text-editor";
export * from "./types";

export const TOL_DS = new TsDataSource(env.TOL_DATA);
export const PIPELINE_DS = new TsDataSource();
export const CORE_CONFIG_DS = new TsDataSource({
  ...env.TOL_DATA,
  apiDataPath: API_PATHS.BOARDS,
  dataspace: "",
});
export const LOCAL_DS = new TsDataSource({
  apiPath: API_PATHS.API_PATH,
  apiDataPath: API_PATHS.LOCAL,
  dataspace: ""
});
export const ACTIONS_DS = LOCAL_DS;
