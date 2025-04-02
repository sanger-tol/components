/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Toggle } from 'rsuite';
import {
  Button,
  Drawer,
  Modal,
  AttributeSelector,
  PopUpMessage
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

interface intervalListItem {
  label: string;
  value: HistogramGrouping;
}

function ChartConfigDrawer(props: Props) {
  const {
    baseUrl,
    open,
    setOpen,
    title,
    endpoint,
    onConfigSave,
    config
  } = props;
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  const [xAxis, setXAxis] = useState<string[]>(config.xAxis ? [config.xAxis] : []);
  const [breakDownBy, setBreakDownBy] = useState<string[]>(config.breakDownBy ? [config.breakDownBy] : []);
  const [stacked, setStacked] = useState<boolean>(config.stacked);
  const [type, setType] = useState<HistogramGrouping>(config.type);

  const saveConfig = () => {
    const updatedConfig: ChartConfig = {
      breakDownBy: breakDownBy[0],
      stacked: stacked,
      type: type,
      xAxis: xAxis[0]
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
          if (xAxis.length === 0 || breakDownBy.length === 0 || type == undefined) {
            PopUpMessage({type: 'error', message: 'Please fill out all fields before saving.'});
          } else {
            saveConfig()
            setOpenSaveModal(false);
          }
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
    const updatedConfig: ChartConfig = {
      breakDownBy: breakDownBy[0],
      stacked: stacked,
      type: type,
      xAxis: xAxis[0]
    };
    if (JSON.stringify(updatedConfig) != JSON.stringify(config)) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setBreakDownBy([config.breakDownBy]);
    setStacked(config.stacked);
    setType(config.type);
    setXAxis([config.xAxis]);
    setOpenSaveModal(false);
    setOpen(false);
  };

  const intervals:intervalListItem[] = [
    {
      label: "Day",
      value: "d",
    },
    {
      label: "Week",
      value: "w",
    },
    {
      label: "Month",
      value: "M",
    },
    {
      label: "Year",
      value: "y",
    },
  ];

  const buttons = (
    <div style={{display: "flex",}}>
      {intervals.map((interval: intervalListItem) => (
        <Button
          outline
          key={interval.label}
          text={interval.label}
          type="primary"
          onClick={() => setType(interval.value)}
          active={type === interval.value}
          size="lg"
          className="tol-chart-interval-buttons"
        />
      ))}
    </div>
  )

  const content = (
    <div>
      <div>
        <h6>X Axis</h6>
        <AttributeSelector
          endpoint={endpoint}
          placeholder="Select X-Axis Attribute..."
          baseUrl={baseUrl}
          attribute={xAxis}
          setAttribute={setXAxis}
          maxSelections={1}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          renderSearchBySource={true}
          displaySource={true}
          sticky={true}
          allowedTypes={["datetime"]}
        />
      </div>
      <h6>Interval</h6>
      {buttons}
      <div>
        <h6>Break Down By</h6>
        <AttributeSelector
          endpoint={endpoint}
          placeholder="Select Attribute to Break Down By..."
          baseUrl={baseUrl}
          attribute={breakDownBy}
          setAttribute={setBreakDownBy}
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
          onChange={() => {
            setStacked(!stacked);
          }}
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
