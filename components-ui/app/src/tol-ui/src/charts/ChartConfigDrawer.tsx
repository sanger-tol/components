/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Toggle } from 'rsuite';
import {
  Button,
  Drawer,
  Modal,
  AttributeSelector
} from "../index";
import { HistogramGrouping } from "./utils";


export interface Props {
  baseUrl?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  onConfigSave: (config: object) => void;
  endpoint: string;
  sticky?: boolean;
  config: ChartConfig;
  ds: any;
}

interface ChartConfig {
  breakDownBy: string,
  xAxis: string,
  stacked: boolean,
  type: HistogramGrouping,
}

function ChartConfigDrawer(props: Props) {
  const {
    baseUrl,
    open,
    setOpen,
    title,
    endpoint,
    onConfigSave,
    ds,
    config
  } = props;
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  const [xAxis, setXAxis] = useState<string[]>(config.xAxis ? [config.xAxis] : []);
  const [breakDownBy, setBreakDownBy] = useState<string[]>(config.breakDownBy ? [config.breakDownBy] : []);
  const [stacked, setStacked] = useState<boolean>(config.stacked);
  const [type, setType] = useState<HistogramGrouping>(config.type);

  const saveConfig = () => {
    const updatedConfig = {
      breakDownBy: breakDownBy[0],
      xAxis: xAxis[0],
      stacked: stacked,
      type: "bar"
    };
    if (JSON.stringify(config) !== JSON.stringify(updatedConfig)) {
      onConfigSave(updatedConfig);
    }
    setOpen(!open);
  };

  const unsavedChangesModal = () => {
    return (
      <div>
        <Modal
          open={openSaveModal}
          setOpen={setOpenSaveModal}
          size="sm"
          children={modalContent}
          closeButton={false}
          actionButton={modalButtons}
        />
      </div>
    );
  };

  const modalContent = (
    <div>
      <h3>Unsaved Changes</h3>
      <p>
        You have an unsaved configuration, are you sure you wish to close
        without saving?
      </p>
    </div>
  );

  const cancelButton = (text?: string) => {
    return (
      <Button
        text={text ?? "Cancel"}
        type="error"
        onClick={() => setOpenSaveModal(false)}
      />
    );
  };

  const discardButton = (text?: string) => {
    return (
      <div className="tol-config-drawer-modal-discard-btn">
        <Button
          text={text ?? "Discard"}
          type="warning"
          onClick={() => confirmDiscard()}
        />
      </div>
    );
  };

  const saveButton = (text?: string) => {
    return (
      <Button
        text={text ?? "Save"}
        type="success"
        onClick={() => {
          saveConfig(), setOpenSaveModal(false);
        }}
      />
    );
  };

  const modalButtons = (
    <div
      className="tol-config-drawer-modal-btns"
      style={{ justifyContent: "flex-end" }}
    >
      {cancelButton()}
      {discardButton()}
      {saveButton()}
    </div>
  );

  const drawerButtons = (
    <div
      className="tol-config-drawer-modal-btns"
      style={{ justifyContent: "space-between" }}
    >
      <div>{saveButton("Save and Close")}</div>
      <div>{discardButton("Discard and Close")}</div>
    </div>
  );

  const handleCloseDrawer = () => {
    if (true) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setOpenSaveModal(false);
    setOpen(false);
  };

  const intervals = ['M', 'd', 'w', 'y'];

  const buttons = (
    <div style={{display: 'felx', flexDirection: 'row'}}>
      {intervals.map((interval: HistogramGrouping) => (
        <Button
          outline
          key={interval}
          text={interval}
          type="primary"
          onClick={() => setType(interval)}
          active={type === interval}
        />
      ))}
    </div>
  )

  const content = (
    <div>
      <h6>X Axis</h6>
      <div>
        <AttributeSelector
          endpoint={endpoint}
          placeholder="Select X-Axis Attribute..."
          baseUrl={baseUrl}
          attribute={xAxis}
          setAttribute={setXAxis}
          disabledValues={null}
          numPopulatedFields={0}
          maxSelections={1}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          renderSearchBySource={true}
          displaySource={true}
          sticky={true}
        />
      </div>
      <h6>Interval</h6>
      {buttons}
      <h6>Break Down By</h6>
      <div>
        <AttributeSelector
          endpoint={endpoint}
          placeholder="Select Attribute to Break Down By..."
          baseUrl={baseUrl}
          attribute={breakDownBy}
          setAttribute={setBreakDownBy}
          disabledValues={null}
          numPopulatedFields={0}
          maxSelections={1}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          renderSearchBySource={true}
          displaySource={true}
          sticky={true}
        />
      </div>
      <h6>Stacked</h6>
      <div style={{marginBottom: "15px"}}>
        <Toggle
          key="stacked-toggle"
          checked={stacked}
          onChange={() => setStacked(!stacked)}
        />
      </div>
      <div>
        <div className="tol-config-drawer-save-button">{drawerButtons}</div>
      </div>
    </div>
  )

  return (
    <div>
      {unsavedChangesModal()}
      <Drawer
        title={title}
        open={open}
        setOpen={setOpen}
        children={content}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

export default ChartConfigDrawer;
