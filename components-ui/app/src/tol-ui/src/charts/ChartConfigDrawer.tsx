/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Toggle } from "rsuite";
import {
  Button,
  Drawer,
  Modal,
  AttributeSelector,
  PopUpMessage,
  IconTooltip,
  normaliseCaps,
  IRemoteTargetAndZone,
  IChartConfig,
  HistogramGrouping
} from "..";


interface IIntervalListItem {
  label: string;
  value: HistogramGrouping;
}

export interface IChartConfigDrawer extends IRemoteTargetAndZone {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  displaySource?: boolean;
  onConfigSave: (config: object) => void;
  sticky?: boolean;
  config: IChartConfig;
}

export function ChartConfigDrawer(props: IChartConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config
  } = props;

  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);
  const [xAxis, setXAxis] = useState<string[]>(
    config.xAxis ? [config.xAxis] : []
  );
  const [breakDownBy, setBreakDownBy] = useState<string[]>(
    config.breakDownBy ? [config.breakDownBy] : []
  );
  const [stacked, setStacked] = useState<boolean>(config.stacked);
  const [grouping, setGrouping] = useState<HistogramGrouping>(config.grouping);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter'>(config.chartType);
  const [returnedMeta, setReturnedMeta] = useState<any>(null);
  const [returnedMetaType, setReturnedMetaType] = useState<string>("");

  useEffect(() => {
    if (returnedMeta) {
      const firstKey = Object.keys(returnedMeta)[0];
      setReturnedMetaType(returnedMeta[firstKey]?.python_type);
    }
  }, [returnedMeta]);

  const saveConfig = () => {
    const updatedConfig: IChartConfig = {
      breakDownBy: breakDownBy[0],
      stacked: stacked,
      grouping: returnedMetaType === "datetime" ? grouping : "categorical",
      xAxis: xAxis[0],
      chartType: chartType,
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
          if (
            xAxis.length === 0 ||
            breakDownBy.length === 0 ||
            (returnedMetaType === "datetime" && (grouping === "categorical" || grouping === undefined))
          ) {
            PopUpMessage({
              type: "error",
              message: "Please fill out all fields before saving.",
            });
          } else {
            saveConfig();
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
    const updatedConfig: IChartConfig = {
      breakDownBy: breakDownBy[0],
      stacked: stacked,
      grouping: returnedMetaType === "datetime" ? grouping : "categorical",
      xAxis: xAxis[0],
      chartType: 'bar',
    };
    if (JSON.stringify(updatedConfig) != JSON.stringify(config)) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
  };

  const confirmDiscard = () => {
    setBreakDownBy(config.breakDownBy ? [config.breakDownBy] : []);
    setStacked(config.stacked);
    setGrouping(config.grouping);
    setXAxis(config.xAxis ? [config.xAxis] : []);
    setOpenSaveModal(false);
    setOpen(false);
  };

  const intervals: IIntervalListItem[] = [
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

  const chartTypes = ['bar', 'line', 'scatter']

  const IntervalButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {intervals.map((interval: IIntervalListItem) => (
        <Button
          outline
          key={interval.label}
          text={interval.label}
          type="primary"
          onClick={() => setGrouping(interval.value)}
          active={grouping === interval.value}
          size="lg"
          className="tol-board-chart-interval-buttons"
        />
      ))}
    </div>
  );

  const ChartTypeButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {chartTypes.map((type: 'bar' | 'line' | 'scatter') => (
        <Button
          outline
          key={type}
          text={normaliseCaps(type)}
          type="primary"
          onClick={() => {
            setChartType(type)
            if (type  !== "bar") {
              setStacked(false);
            }
          }
          }
          active={chartType === type}
          size="lg"
          className="tol-board-chart-interval-buttons"
        />
      ))}
    </div>
  );

  const content = (
    <div>
      <div>
        <h6>X Axis</h6>
        <AttributeSelector
          {...props}
          sticky
          renderSearchBySource
          displaySource
          placeholder="Select X-Axis Attribute..."
          attribute={xAxis}
          setAttributes={setXAxis}
          maxSelections={1}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          allowedTypes={["str", "datetime"]}
          setAttributeMeta={setReturnedMeta}
        />
      </div>
      {returnedMetaType === "datetime" && (
        <>
          <h6>Interval</h6>
          {IntervalButtons}
        </>
      )}
      <h6>Chart Type</h6>
      {ChartTypeButtons}
      <div>
        <div className="tol-board-chart-xaxis-container">
        <h6 className="tol-board-chart-xaxis-title">Break Down By</h6>
        <IconTooltip contents={
          "Note: This list has been filtered by cardinality." + 
          "This is the number of available values for a given attribute." +
          "It has been set to max 25 to avoid charts becoming unreadable."}/>
        </div>
        <AttributeSelector
          {...props}
          placeholder="Select Attribute to Break Down By..."
          attribute={breakDownBy}
          setAttributes={setBreakDownBy}
          maxSelections={1}
          populatedFieldType={"column"}
          additionalPopulatedFieldData={"."}
          renderSearchBySource={true}
          displaySource={true}
          sticky={true}
          allowedCardinality={{ operator: "<=", value: 25 }}
        />
      </div>
      {chartType == "bar" ? (
        <>
        <h6>Stacked</h6>
        <div className="tol-board-chart-stacked-toggle">
          <Toggle
            key="stacked-toggle"
            checked={stacked}
            onChange={() => {
              setStacked(!stacked);
            }}
          />
        </div>
        </>
      ) : (
        <></>
      )}
      <div>
        <div className="tol-config-drawer-save-button">{drawerButtons}</div>
      </div>
    </div>
  );

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
