/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import { Progress } from "rsuite";
import { CodeBlock } from "react-code-blocks";
import {
  Button,
  Modal,
  TsDataSource,
  copyToClipboard,
  exportDataToSpreadsheet,
  dataObjectToSpreadsheetData,
  PEditableTitle,
  FieldMeta,
  converterForElapsedTime,
  deepCopy,
  Tabs,
  generateSDKScript,
  generateCLICommand,
  downloadForTable,
  IChartDataset,
  downloadForChart,
  PopUpMessage
} from "..";

interface Props {
  downloadInProgress: boolean;
  setDownloadInProgress: (downloadInProgress: boolean) => void;
  
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
  datasets: IChartDataset[]
  labels: string[]
}

export function DownloadModal(props: Props) {
  const {
    size,
    open,
    setOpen,
    objectType,
    filter,
    source,
    dataSource,
    requestedFields,
    title,
    fieldMeta,
    totalSize,
    downloadInProgress,
    setDownloadInProgress,
    componentType = 'table',
    datasets,
    labels
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

  const sourceToUse = source || "portal";

  const SDKText = generateSDKScript(sourceToUse, filter, objectType)

  const CLICommand = generateCLICommand(sourceToUse, filter, objectType, requestedFields)

  const onDownloadSpreadsheet = async () => {
    setDownloadInProgress(true);
    setDownloadComplete(false);
    setFetchCount(0);
    setSecondsElapsed(0);
    setPercentageComplete(0);

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
        setDownloadComplete,
        setStopDownload,
        setDownloadInProgress,
        setStopDownloadLoading,
        interval
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
        setDownloadComplete,
        setStopDownload,
        setDownloadInProgress,
        setStopDownloadLoading,
        interval,
        stopDownloadRef,
      )
    }
  };

  const MinimizeButton = (
    <Button
      type="warning"
      onClick={() => setOpen(false)}
      icon="minus"
      position="right"
    />
  );

  const instructions = (
    <>
      <p>
        To use this code snippet you'll need to have the ToL Python SDK installed in your
        Python environment:
      </p>
      <div className="tol-code-block">
        <CodeBlock
          text="pip install tol-sdk"
          language="bash"
          showLineNumbers={false}
        />
      </div>
    </>
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
          </Tabs.Tab>
          <Tabs.Tab eventKey="2" title="SDK">
            <div className="tol-code-block">
              <CodeBlock
                text={SDKText}
                language="python"
                showLineNumbers={false}
              />
            </div>
            <br />
            <Button
              onClick={() => copyToClipboard(SDKText.trim())}
              icon="copy"
              text="Copy to Clipboard"
            />
            <br />
            {instructions}
          </Tabs.Tab>
          <Tabs.Tab eventKey="3" title="CLI">
            <div className="tol-code-block">
              <CodeBlock
                text={CLICommand}
                language="bash"
                showLineNumbers={false}
              />
            </div>
            <br />
            <Button
              onClick={() => copyToClipboard(CLICommand.trim())}
              icon="copy"
              text="Copy to Clipboard"
            />
            <br />
            {instructions}
          </Tabs.Tab>
        </Tabs>
      </Modal>
    </>
  );
}
