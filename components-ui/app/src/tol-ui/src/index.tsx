// SPDX-FileCopyrightText: 2022 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

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

// board
export * from "./boards";

// charts
export * from "./charts";

// datasource
export { TsDataSource } from "./datasource";

// drag & drop

// filter
export { Filter, RemoteFilters, BoardFilters, resetZone } from "./filtering";

// forms
export {
  AutoComplete,
  Dropzone,
  SingleSelect,
  CountrySelect,
  SingleSelectCustomOption,
  FormTextField,
  FormAllInOne,
  FormCheckboxes,
  MultipleSelect,
} from "./forms";

// factories
export { createTextGeneratorFactory } from "./factories";

// messaging
export {
  Message,
  Notification,
  StaticMessage,
  StatusMessage,
  PopUpMessage,
} from "./messaging";

// general
export {
  Header,
  CentreContents,
  InfoTooltip,
  FormatTooltip,
  Modal,
  Placeholder,
  Widgets,
  RemoteGet,
  ObjectDetail,
  RemoteCount,
  HoverOverlay,
  ClickOverlay,
  formatDate,
  InlineEdit,
  Drawer,
  LoadingContent,
  Button,
  Icon,
  TolLoader,
  SourceTag,
  AttributeSelector,
  DropdownButtons,
  DownloadModal,
  Markdown,
  EntityMetaToolTip,
  BoardCount,
  SelectedAttributesContainer,
  UtilityBar
} from "./general";

// hooks
export * from "./hooks";

// models
export type { HeaderButton, Page, Dropdown, IFilter } from "./models";

// nav
export { Callback, Login, Navigation, ProfileDropdown } from "./nav";

// services
export { httpClient, DetailAttribute } from "./services";

// table
export { RemoteTable, BoardTable } from "./table";

// timelines
export { Timeline, RemoteTimeline } from "./timeline";

// app
export { default as TolApp } from "./smart-app/TolApp";

// variables
export { env } from "./variables";
