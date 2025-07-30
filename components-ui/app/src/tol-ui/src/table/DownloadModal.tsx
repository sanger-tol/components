/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import { Tabs, Progress } from "rsuite";
import { CodeBlock } from "react-code-blocks";
import {
  Button,
  Modal,
  PopUpMessage,
  TsDataSource,
  copyToClipboard,
  exportDataToSpreadsheet,
  dataObjectToSpreadsheetData,
  IInlineEdit,
  FieldMeta,
  converterForElapsedTime,
} from "..";

interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType: string;
  filter?: any;

  source?: string;
  dataSource: TsDataSource;
  requestedFields: string[] | string;
  title: IInlineEdit | undefined;
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
    title,
    fieldMeta,
    totalSize,
    downloadInProgress,
    setDownloadInProgress,
  } = props;
  const [current, setCurrent] = useState<number>(0);
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [stopDownload, setStopDownload] = useState<boolean>(false);
  const [stopDownloadLoading, setStopDownloadLoading] = useState<boolean>(false);
  const stopDownloadRef = useRef<boolean>(false);

  useEffect(() => {
    stopDownloadRef.current = stopDownload;
  }, [stopDownload]);

  const requestedFields = Array.isArray(props.requestedFields)
    ? props.requestedFields.join(",")
    : props.requestedFields;

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
--fields=${requestedFields} \
--output=tsv 
  `;

  const onClick = (text: string) => {
    copyToClipboard(text.trim());
    PopUpMessage({
      type: "success",
      message: "Copied to clipboard",
    });
  };

  const fetchSpreadSheetDataObjects = async (gen: AsyncGenerator) => {
    const results: any[] = []; // TODO: add type - kh16

    for await (const item of gen) {
      setCurrent((prev) => {
        const next = prev + 1;
        const percentage = Math.floor((next / totalSize) * 100);
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
    setCurrent(0);
    setSecondsElapsed(0);
    setPercentageComplete(0);

    const gen = dataSource.getListByCursor({
      objectType: objectType,
      filter: filter,
      requestedFields: requestedFields,
    });

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    fetchSpreadSheetDataObjects(gen)
      .then((results) => {
        dataObjectToSpreadsheetData(
          results,
          requestedFields.split(","),
          fieldMeta
        )
          .then((info) => {
            exportDataToSpreadsheet(info, title);
          })
          .finally(() => {
            setDownloadInProgress(false);
          });
      })
      .catch(() => {
        setDownloadInProgress(false);
        setStopDownloadLoading(false);
        setStopDownload(false);
        stopDownloadRef.current = false;
      })
      .finally(() => {
        clearInterval(interval);
      })
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
                    text={
                      stopDownloadLoading ? "Stopping..." : "Stop Download"
                    }
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
                  <div style={{ textAlign: "center" }}>
                    <span>
                      {percentageComplete !== 100 && (
                        <>
                          {current}/{totalSize}
                        </>
                      )}
                    </span>
                    <span style={{ marginLeft: "10px" }}>
                      {converterForElapsedTime(secondsElapsed)}
                    </span>
                  </div>
                </>
              ) : (
                <Button
                  type="success"
                  text="Download as Spreadsheet"
                  onClick={() => {
                    onDownloadSpreadsheet();
                  }}
                  icon="download"
                />
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
