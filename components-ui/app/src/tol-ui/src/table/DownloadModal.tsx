/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Tabs } from "rsuite";
import { CodeBlock } from "react-code-blocks";
import {
  Button,
  Modal,
  PopUpMessage,
  TsDataSource,
  copyToClipboard,
  progressBar,
  exportDataToSpreadsheet,
  IGetList,
  getFieldByName,
  dataObjectToSpreadsheetData,
  IInlineEdit,
  ITableCount,
  ICountProps,
} from "..";
import { Progress } from "rsuite";
import { Dispatch, useState } from "react";

interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType?: string;
  filter?: any;

  source?: string;
  dataSource: TsDataSource;
  requestedFields: string[] | string;
  totalSize: number;
  title: IInlineEdit;
  fieldMeta: any;
}

export interface IProgressThreshold {
  setTotal: Dispatch<React.SetStateAction<number>>;
  setCurrent: Dispatch<React.SetStateAction<number>>;
  setPercentageComplete: Dispatch<React.SetStateAction<number>>;
}

export function DownloadModal(props: Props & ICountProps) {
  const {
    size,
    open,
    setOpen,
    objectType,
    filter,
    source,
    dataSource,
    totalSize,
    title,
    fieldMeta,
    count,
  } = props;
  console.log();
  const [clicked, isClicked] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
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

  const onDownloadSpreadsheet = async () => {
    await progressBar(
      {
        objectType: objectType || "",
        filter,
        requestedFields: requestedFields,
      },
      { setTotal, setCurrent, setPercentageComplete },
      dataSource,
      count
    ).then((response) => {
      dataObjectToSpreadsheetData(
        response,
        requestedFields.split(","),
        fieldMeta
      ).then((info) => exportDataToSpreadsheet(info, title));
    });
  };
  return (
    <>
      <Modal size={size} open={open} setOpen={setOpen}>
        <Tabs defaultActiveKey="1">
          <Tabs.Tab eventKey="1" title="Spreadsheet">
            <div className="tol-download-modal-body">
              <Button
                type="success"
                text="Download as Spreadsheet"
                onClick={() => {
                  onDownloadSpreadsheet();
                  setOpen(true);
                  isClicked(true);
                }}
                icon="download"
                disabledTooltip={
                  totalSize >= 1
                    ? "Only 10,000 results can currently be downloaded as a spreadsheet."
                    : undefined
                }
                disabled={
                  totalSize >= 100000 || (clicked && percentageComplete != 100)
                }
              />
            </div>
            {clicked ? (
              <Progress.Line
                percent={percentageComplete}
                status={percentageComplete === 100 ? "success" : "active"}
              />
            ) : (
              <></>
            )}
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
