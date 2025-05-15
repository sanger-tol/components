/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Modal, PopUpMessage } from "..";
import { Tabs } from "rsuite";
import { CodeBlock } from 'react-code-blocks';
import { copyToClipboard } from "./utils";


export interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType?: string;
  filter?: any;
  action: Function;
  source?: string;
  fields: string[];
  totalSize: number;
}

function DownloadModal(props: Props) {
  const { size, open, setOpen, action, objectType, filter, source, fields, totalSize } = props;

  const stringifyFilter = (filter: any) => {
    if (!filter) {
      return 'None';
    }
    // @ts-ignore
    return JSON.stringify(filter, (key, value) => {
      if (typeof value === 'boolean') {
        return value ? 'True' : 'False';
      }
      return value;
    }).replace(/"True"/g, 'True').replace(/"False"/g, 'False');
  };

  const sourceToUse = source || 'portal';

  const SDKText = `from tol.core import DataSourceFilter
from tol.sources.${sourceToUse} import ${sourceToUse}

src = ${sourceToUse}()
f = DataSourceFilter(
    and_ = ${stringifyFilter(filter?.and_)}
)
objs = src.get_list('${objectType}', object_filters=f) 
  `

  const CLICommand = `
tol data \
--source=${sourceToUse || 'portal'} \
--operation=list \
--type=${objectType} \
--filter='${JSON.stringify(filter) || '{"and":{}}'}' \
--fields=${fields.join(',')} \
--output=tsv 
  `

  const onClick = (text: string) => {
    copyToClipboard(text.trim())
    PopUpMessage({
      type: 'success',
      message: 'Copied to clipboard',
    })
  }

  return (
    <>
      <Modal
        size={size}
        open={open}
        setOpen={setOpen}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.Tab eventKey="1" title="Spreadsheet">
            <div className="tol-download-modal-body">
              <Button
                type="success"
                text="Download as Spreadsheet"
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                icon="download"
                disabledTooltip={
                  totalSize >= 1
                    ? "Only 10,000 results can currently be downloaded as a spreadsheet."
                    : undefined
                }
                disabled={totalSize >= 10000}
              />
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
};

export default DownloadModal;
