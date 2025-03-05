/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Modal } from "..";
import { Tabs } from "rsuite";
import { CodeBlock } from 'react-code-blocks';


export interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType?: string;
  filter?: any;
  action: Function;
  source?: string;
}

const DownloadModal = (props: Props) => {
  const { size, open, setOpen, action, objectType, filter, source } = props;

  const sourceToUse = source || 'portal';

  const SDKText = `
  from tol.core import DataSourceFilter
  from tol.sources.${sourceToUse} import ${sourceToUse}

  src = ${sourceToUse}()
  f = DataSourceFilter(
      and_ = ${JSON.stringify(filter) || 'None'}
  )
  objs = src.get_list(${objectType}, object_filters=f) 
  `

  const CLICommand = `
  tol data \
  --source=${sourceToUse || 'portal'} \
  --type=${objectType} \
  --filter=${JSON.stringify(filter)} \
  --output=csv 
  ` 

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
            />
          </div>
        </Tabs.Tab>
        <Tabs.Tab eventKey="2" title="SDK">
          <div className="tol-download-modal-code">
            <CodeBlock
              text={SDKText}
              language="python"
              showLineNumbers={false}
            />
          </div>
        </Tabs.Tab>
        <Tabs.Tab eventKey="3" title="CLI">
          <div className="tol-download-modal-code">
            <CodeBlock
              text={CLICommand}
              language="bash"
              showLineNumbers={false}
            />
          </div>
        </Tabs.Tab>
      </Tabs>
    </Modal>
    </>
  );
};

export default DownloadModal;
