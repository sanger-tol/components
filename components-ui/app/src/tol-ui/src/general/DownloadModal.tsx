/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Modal } from "..";
import { Tabs } from "rsuite";


export interface Props {
  size: string;
  open: boolean;
  setOpen: any;
  objectType?: string;
  action: Function;
}

const DownloadModal = (props: Props) => {
  const { size, open, setOpen, action } = props;

  return (
    <>
    <Modal
      size={size}
      open={open}
      setOpen={setOpen}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.Tab eventKey="1" title="EXCEL">
          <Button
            type="success"
            onClick={() => {
              action();
              setOpen(false);
            }}
            icon="download"
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="2" title="CLI">
          <Button
            type="success"
            onClick={() => {
              action();
              setOpen(false);
            }}
            icon="download"
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="3" title="SDK">
          <Button
            type="success"
            onClick={() => {
              action();
              setOpen(false);
            }}
            icon="download"
          />
        </Tabs.Tab>
      </Tabs>
    </Modal>
    </>
  );
};

export default DownloadModal;
