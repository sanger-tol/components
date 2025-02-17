// SPDX-FileCopyrightText: 2022 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

// Direct package pass-throughs
import { Container, Row, Col, ButtonGroup, Form, Spinner } from 'react-bootstrap';
export { Container, Row, Col, Form, ButtonGroup, Spinner as Loader };
import { Link } from "react-router-dom";
export { Link };
import { useToaster as Toaster, Form as RSForm } from 'rsuite'
export { Toaster, RSForm };

// FontAwesome icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
// Add icons to the library
library.add(fas);

// board
export {
  useZone,
  useTranslator,
  ComponentModal,
  ZoneModal,
  Visualisation,
  View,
  Board,
} from "./boards";


// board components
export {
  DropdownButtons,
  MyBoardsHeader
} from "./boards/components";

// charts
export {
  BarChart,
  RemoteBarChart,
  Map,
  RemoteMap,
  MapLegend,
  Sunburst,
  RemoteSunburst
} from "./charts";

// deprecated
export {
  RemoteAutoComplete,
  MultipleSelect,
  MultipleSelectFilters,
  RemoteMultipleSelectFilters,
  GlobalMultipleSelect,
  Status,
  PopUpMessage as AlertPopUp,
  Alert
} from "./deprecated";

// drag & drop
export { DnD } from "./dnd";

// filter
export {
  Filter,
  RemoteFilters,
  BoardFilters,
  resetZone
} from "./filtering";

// forms
export {
  AutoComplete,
  Dropzone,
  SingleSelect,
  CountrySelect,
  SingleSelectCustomOption,
  FormTextField,
  FormAllInOne,
  FormCheckboxes
} from "./forms";

// messaging
export {
  Message,
  Notification,
  StaticMessage,
  StatusMessage,
  PopUpMessage
} from "./messaging";

// general
export {
  Header,
  CentreContents,
  InfoTooltip,
  Modal,
  Placeholder,
  Widgets,
  RemoteGet,
  ObjectDetail,
  RemoteCount,
  HoverOverlay,
  formatDate,
  InlineEdit,
  Drawer,
  LoadingContent,
  Button,
  Icon,
  TolLoader,
  SourceTag,
  AttributeSelector,
} from "./general";

// hooks
export {
  useEffectUpdate,
  themeListener,
  resizeListener,
  useQuery
} from "./hooks";

// models
export type {
  HeaderButton,
  Page,
  Dropdown,
  IFilter
} from "./models";

// nav
export {
  Callback,
  Login,
  Navigation,
  ProfileDropdown
} from "./nav";

// services
export {
  httpClient,
  TsDataSource,
  DetailAttribute
} from "./services";

// table
export {
  RemoteTable,
  BoardTable
} from "./table";

// timelines
export { Timeline, RemoteTimeline } from "./timeline";

// toL app
export { default as TolApp } from "./TolApp";

// variables
export { env } from './variables';
