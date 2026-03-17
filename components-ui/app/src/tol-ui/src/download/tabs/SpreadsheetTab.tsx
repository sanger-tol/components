/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect } from 'react'
import { Progress } from "rsuite";
import {
  deepCopy,
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
}

export function SpreadsheetTab(props: PSpreadsheetTab) {
  const {
    objectType,
    requestedFields,
    totalSize,
    filter,
    downloadInProgress,
    setDownloadInProgress,
    componentType = "table",
    labels,
    datasets,
    fieldMeta,
    title,
    dataSource
  } = props;

  const [fetchCount, setFetchCount] = useState<number>(0);
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [stopDownload, setStopDownload] = useState<boolean>(false);
  const [stopDownloadLoading, setStopDownloadLoading] =
    useState<boolean>(false);
  const stopDownloadRef = useRef<boolean>(false);
  const [frozenObjectType, setFrozenObjectType] = useState<string>(objectType);
  const [frozenFilter, setFrozenFilter] = useState<object>(deepCopy(filter));
  const [frozenTotalSize, setFrozenTotalSize] = useState<number>(totalSize);
  const [frozenRequestedFields, setFrozenRequestedFields] = useState<string[]>(
    deepCopy(requestedFields)
  );

  useEffect(() => {
    stopDownloadRef.current = stopDownload;
  }, [stopDownload]);

  useEffect(() => {
    if (!downloadInProgress) {
      setFrozenObjectType(objectType);
      setFrozenFilter(deepCopy(filter));
      setFrozenRequestedFields(deepCopy(requestedFields));
      setFrozenTotalSize(totalSize);
    }
  }, [objectType, filter, requestedFields, totalSize, stopDownload]);

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
