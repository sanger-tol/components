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
  PInlineEdit,
  FieldMeta,
  converterForElapsedTime,
  deepCopy,
  Tabs
} from "..";

interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType: string;
  filter?: any;

  source?: string;
  dataSource: TsDataSource;
  requestedFields: string[];
  title?: PInlineEdit;
  fieldMeta: FieldMeta;

  downloadInProgress: boolean;
  setDownloadInProgress: (downloadInProgress: boolean) => void;

  totalSize: number;
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

  const stringifyRequestedFields = (requestedFields: string[]) => {
    return requestedFields.join(",");
  };

  const stringifyFilter = (filter: any) => {
    if (!filter) {
      return "None";
    }
    // @ts-ignore
    return JSON.stringify(filter, (key, value) => {
      if (typeof value === "boolean") {
        return value ? "True" : "False";
      }
      return value;
    })
      .replace(/"True"/g, "True")
      .replace(/"False"/g, "False");
  };

  const sourceToUse = source || "portal";

  const SDKText = `from tol.core import DataSourceFilter
from tol.sources.${sourceToUse} import ${sourceToUse}

src = ${sourceToUse}()
f = DataSourceFilter(
    and_ = ${stringifyFilter(filter?.and_)}
)
objs = src.get_list('${objectType}', object_filters=f) 
  `;

  const CLICommand = `
tol data \
--source=${sourceToUse || "portal"} \
--operation=list \
--type=${objectType} \
--filter='${JSON.stringify(filter) || '{"and":{}}'}' \
--fields=${stringifyRequestedFields} \
--output=tsv 
  `;

  const onClick = (text: string) => {
    copyToClipboard(text.trim());
  };

  const fetchSpreadSheetDataObjects = async (gen: AsyncGenerator) => {
    const results: any[] = []; // TODO: add type - kh16

    for await (const item of gen) {
      setFetchCount((prev) => {
        const next = prev + 1;
        const percentage = Math.floor((next / frozenTotalSize) * 100);
        setPercentageComplete(percentage);
        results.push(item);
        return next;
      });
      if (stopDownloadRef.current) throw Error();
    }
    return results;
  };

  const onDownloadSpreadsheet = async () => {
    setDownloadInProgress(true);
    setDownloadComplete(false);
    setFetchCount(0);
    setSecondsElapsed(0);
    setPercentageComplete(0);

    const gen = dataSource.getListByCursor({
      objectType: frozenObjectType,
      filter: frozenFilter,
      requestedFields: stringifyRequestedFields(frozenRequestedFields),
    });

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    fetchSpreadSheetDataObjects(gen)
      .then((results) => {
        dataObjectToSpreadsheetData(results, frozenRequestedFields, fieldMeta)
          .then((info) => {
            exportDataToSpreadsheet(info, title?.text || frozenObjectType);
          })
          .finally(() => {
            setDownloadComplete(true);
            setDownloadInProgress(false);
          });
      })
      .catch(() => {
        setStopDownload(false);
        stopDownloadRef.current = false;
        setDownloadComplete(false);
        setDownloadInProgress(false);
        setStopDownloadLoading(false);
      })
      .finally(() => {
        clearInterval(interval);
      });
  };

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
              onClick={() => onClick(SDKText)}
              icon="copy"
              text="Copy to Clipboard"
            />
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
              onClick={() => onClick(CLICommand)}
              icon="copy"
              text="Copy to Clipboard"
            />
          </Tabs.Tab>
        </Tabs>
      </Modal>
    </>
  );
}
