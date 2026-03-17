/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  Modal,
  TsDataSource,
  PEditableTitle,
  FieldMeta,
  Tabs,
  IChartDataset,
} from "..";
import { CommandLineTab, ImageTab, SDKTab, SpreadsheetTab } from "./tabs";

export interface PDownloadModal {
  downloadInProgress: boolean;
  setDownloadInProgress: (downloadInProgress: boolean) => void;
  componentId: string

  size: string;
  open: boolean;
  setOpen: any;
  totalSize: number;

  // Tabe specific props 
  objectType: string;
  filter?: any;

  source?: string;
  dataSource?: TsDataSource;
  requestedFields: string[];
  title?: PEditableTitle;
  fieldMeta?: FieldMeta;

  componentType?: string

  // Chart specific props
  datasets?: IChartDataset[]
  labels?: string[]
}

export function DownloadModal(props: PDownloadModal) {
  const {
    size,
    open,
    setOpen,
    objectType,
    filter,
    source,
    requestedFields,
    title,
    componentId
  } = props;

  const sourceToUse = source || "portal";

  const MinimizeButton = (
    <Button
      type="warning"
      onClick={() => setOpen(false)}
      icon="minus"
      position="right"
    />
  );

  return (
    <>
      <Modal
        size={size}
        open={open}
        setOpen={setOpen}
        actionButton={MinimizeButton}
        closeButton={false}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.Tab eventKey="1" title="Spreadsheet">
            <SpreadsheetTab {...props} />
          </Tabs.Tab>
          <Tabs.Tab eventKey="2" title="SDK">
            <SDKTab source={sourceToUse} objectType={objectType} filter={filter} />
          </Tabs.Tab>
          <Tabs.Tab eventKey="3" title="CLI">
            <CommandLineTab source={sourceToUse} objectType={objectType} filter={filter} requestedFields={requestedFields} />
          </Tabs.Tab>
          <Tabs.Tab eventKey="4" title="Image">
            <ImageTab objectType={objectType} title={title} componentId={componentId} />
          </Tabs.Tab>
        </Tabs>
      </Modal>
    </>
  );
}
