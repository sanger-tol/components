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
  TDisabledTab,
} from "..";
import { CommandLineTab, ImageTab, SDKTab, SpreadsheetTab } from "./tabs";

export interface PDownloadModal {

  /**
   * List of tabs to disable
   */
  disabledTabs?: TDisabledTab[]
  /**
   * State indicating whether a download is currently in progress, used to disable interactions and show loading states as needed
   */
  downloadInProgress: boolean;
  /**
   * Function to update the downloadInProgress state
   */
  setDownloadInProgress: (downloadInProgress: boolean) => void;
  /**
   * Unique identifier for the component, mostly used for downloading images
   */
  componentId: string
  /**
   * Specifies which component the modal is being used for,
   * will default to table
   */
  componentType?: string
  /**
   * Specifies the size of the modal
   */
  size: string;
  /**
   * Specifies whether the modal is open or closed
   */
  open: boolean;
  /**
   * Function to update the open state of the modal
   */
  setOpen: any;
  /**
   * Specifies the total size of data objects being downloaded,
   * used to inform users about the scale of their download and potentially trigger warnings for large downloads
   */
  totalSize: number;
  /**
   * Title of the component, used in the header of the modal and in generated file names for downloads
   */
  title?: PEditableTitle;

  // Tabe specific props 
  /**
   * Object type of the data being downloaded
   */
  objectType: string;
  /**
   * Any filters applied to the component itself, used when retrieving data for download
   */
  filter?: any;
  /**
   * DataSource used to retrieve data,
   * needed for SDK and CLI tabs to generate appropriate commands and scripts
   */
  source?: string;
  /**
   * The actual TSDataSource instance, used for fetching metadata and data for downloads when necessary (Table Only)
   */
  dataSource?: TsDataSource;
  /**
   * Specifies the fields to be requested for download (Table Only)
   */
  requestedFields: string[];
  /**
   * Field meta for the data being downloaded (Table Only)
   */
  fieldMeta?: FieldMeta;

  // Chart specific props
  /**
   * Datasets being downloaded from a chart (Chart Only)
   */
  datasets?: IChartDataset[]
  /**
   * Labels for the chart, typically the x axis values (Chart Only)
   */
  labels?: string[]
}

/**
 * @autodoc
 * 
 * DownloadModal is a reusable component that provides a modal with tabs for downloading data in various formats (Spreadsheet, SDK, CLI, Image).
 */
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
    componentId,
    disabledTabs
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
          {disabledTabs?.includes("Spreadsheet") ? null : (
            <Tabs.Tab eventKey="1" title="Spreadsheet">
              <SpreadsheetTab {...props} />
            </Tabs.Tab>
          )}
          {disabledTabs?.includes("SDK") ? null : (
            <Tabs.Tab eventKey="2" title="SDK">
              <SDKTab source={sourceToUse} objectType={objectType} filter={filter} />
            </Tabs.Tab>
          )}
          {disabledTabs?.includes("CLI") ? null : (
            <Tabs.Tab eventKey="3" title="CLI">
              <CommandLineTab source={sourceToUse} objectType={objectType} filter={filter} requestedFields={requestedFields} />
            </Tabs.Tab>
          )}
          {disabledTabs?.includes("Image") ? null : (
            <Tabs.Tab eventKey="4" title="Image">
              <ImageTab objectType={objectType} title={title} componentId={componentId} />
            </Tabs.Tab>
          )}
        </Tabs>
      </Modal>
    </>
  );
}
