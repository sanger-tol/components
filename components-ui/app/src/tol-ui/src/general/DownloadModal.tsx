/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Modal, CentreContents } from "..";
import { Tabs } from "rsuite";
import { CopyBlock, monokai, a11yDark, a11yLight } from 'react-code-blocks';


export interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType?: string;
  filter?: string;
  action: Function;
}

const DownloadModal = (props: Props) => {
  const { size, open, setOpen, action, objectType, filter } = props;

  const text = `
  from tol.core import DataSourceFilter
  from tol.sources.{source} import {source}

  src = ${objectType}()
  f = DataSourceFilter(
      and_=${filter}
  )
  objs = src.get_list(${objectType}, object_filters=f)
  `


  return (
    <>
    <Modal
      size={size}
      open={open}
      setOpen={setOpen}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.Tab eventKey="1" title="EXCEL">
          <div className="tol-download-modal-body">
            <Button
              type="success"
              text="Download to Excel"
              onClick={() => {
                action();
                setOpen(false);
              }}
              icon="download"
            />
          </div>
        </Tabs.Tab>
        <Tabs.Tab eventKey="2" title="SDK">
          <CopyBlock
            text={text}
            language="python"
            showLineNumbers={false}
            theme={monokai}
            wrapLines
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="3" title="CLI">

        </Tabs.Tab>
      </Tabs>
    </Modal>
    </>
  );
};

export default DownloadModal;
