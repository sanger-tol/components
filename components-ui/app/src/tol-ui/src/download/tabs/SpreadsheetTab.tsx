/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MutableRefObject } from "react"
import { Progress } from "rsuite";
import {
  downloadForChart,
  downloadForTable,
  FieldMeta,
  IChartDataset,
  IFilter,
  PEditableTitle,
  TsDataSource,
  Button,
  converterForElapsedTime,
} from "../..";

export interface PSpreadsheetTab {
  objectType: string,
  requestedFields: string[]
  totalSize: number
  filter?: IFilter
  downloadInProgress: boolean
  setDownloadInProgress: (inProgress: boolean) => void
  componentType?: string
  datasets?: IChartDataset[]
  labels?: string[]
  title?: PEditableTitle
  fieldMeta?: FieldMeta
  dataSource?: TsDataSource
  // These must live in DownloadModal as SpreadhseetTab is unmounted
  // whenever the Modal is closed, which resets the states
  fetchCount: number
  setFetchCount: (n: number) => void
  percentageComplete: number
  setPercentageComplete: (n: number) => void
  secondsElapsed: number
  setSecondsElapsed: (secondsElapsed: number) => void
  downloadComplete: boolean
  setDownloadComplete: (b: boolean) => void
  stopDownload: boolean
  setStopDownload: (b: boolean) => void
  stopDownloadLoading: boolean
  setStopDownloadLoading: (b: boolean) => void
  stopDownloadRef: MutableRefObject<boolean>
  frozenObjectType: string
  setFrozenObjectType: (s: string) => void
  frozenFilter: object
  setFrozenFilter: (f: object) => void
  frozenTotalSize: number
  setFrozenTotalSize: (n: number) => void
  frozenRequestedFields: string[]
  setFrozenRequestedFields: (f: string[]) => void
}

export function SpreadsheetTab(props: PSpreadsheetTab) {
  const {
    totalSize,
    downloadInProgress,
    setDownloadInProgress,
    componentType = "table",
    labels,
    datasets,
    fieldMeta,
    title,
    dataSource,
    fetchCount,
    setFetchCount,
    percentageComplete,
    setPercentageComplete,
    secondsElapsed,
    setSecondsElapsed,
    downloadComplete,
    setDownloadComplete,
    setStopDownload,
    stopDownloadLoading,
    setStopDownloadLoading,
    stopDownloadRef,
    frozenObjectType,
    frozenFilter,
    frozenTotalSize,
    frozenRequestedFields,
  } = props;

  const onDownloadComplete = () => {
    setDownloadComplete(true);
    setDownloadInProgress(false);
  }

  const onDownloadFail = () => {
    setStopDownload(false);
    stopDownloadRef.current = false;
    setDownloadComplete(false);
    setDownloadInProgress(false);
    setStopDownloadLoading(false);
  }

  const onDownloadStart = () => {
    setDownloadInProgress(true);
    setDownloadComplete(false);
    setFetchCount(0);
    setSecondsElapsed(0);
    setPercentageComplete(0);
  }

  const onDownloadSpreadsheet = async () => {
    onDownloadStart()

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    if (componentType == 'table' && fieldMeta && dataSource) {
      downloadForTable(
        dataSource,
        frozenObjectType,
        frozenFilter,
        frozenRequestedFields,
        fieldMeta,
        title,
        stopDownloadRef,
        setFetchCount,
        setPercentageComplete,
        frozenTotalSize,
        interval,
        onDownloadFail,
        onDownloadComplete
      )
    } else if (componentType == 'barchart' && datasets && labels) {
      downloadForChart(
        datasets,
        labels,
        title,
        setFetchCount,
        setPercentageComplete,
        frozenTotalSize,
        frozenObjectType,
        interval,
        onDownloadFail,
        onDownloadComplete
      )
    } else {
      // If not configured correctly it should automatically fail and stop
      onDownloadFail()
    }
  };

  return (
    <div className="tol-download-modal-body">
      {downloadInProgress ? (
        <>
          <Button
            type="error"
            text={stopDownloadLoading ? "Stopping..." : "Stop Download"}
            onClick={() => {
              setStopDownload(true);
              setStopDownloadLoading(true);
            }}
            icon="stop"
          />
          <Progress.Line
            percent={percentageComplete}
            status={percentageComplete === 100 ? "success" : "active"}
          />
        </>
      ) : (
        <Button
          type="success"
          text="Download as Spreadsheet"
          onClick={() => {
            onDownloadSpreadsheet();
          }}
          icon="download"
          disabled={totalSize >= 50000}
          disabledTooltip="Download limit of 50,000 rows."
        />
      )}
      {(downloadInProgress || downloadComplete) && (
        <div className="tol-download-progress-figures">
          <div
            className={downloadComplete ? "tol-download-complete" : ""}
          >
            {downloadInProgress && (
              <>
                {fetchCount}/{frozenTotalSize}
                <span className="tol-download-figure-spacer" />
              </>
            )}
            {downloadComplete && "Last download completed in "}
            {converterForElapsedTime(secondsElapsed)}
          </div>
        </div>
      )}
      {downloadInProgress && (
        <div className="tol-download-progress-message">
          Your spreadsheet download is in progress. Please feel free to
          minimize this window, and continue using this page, but do not
          refresh the window.
        </div>
      )}
    </div>
  );
}
