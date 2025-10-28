/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { Toggle } from "rsuite";
import {
  Button,
  Drawer,
  AttributeSelector,
  IconTooltip,
  normaliseCaps,
  IRemoteTargetAndZone,
  IChartConfig,
  HistogramGrouping,
  RequiredAsterisk
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
  sticky?: boolean;
  config: IChartConfig;
  onConfigSave: (config: object) => void;
}

export function ChartConfigDrawer(props: IChartConfigDrawer) {
  const {
    open,
    setOpen,
    title,
    onConfigSave,
    config,
  } = props;

  const [xAxis, setXAxis] = useState<string[]>(config.xAxis ? [config.xAxis] : []);
  const [breakDownBy, setBreakDownBy] = useState<string[]>(config.breakDownBy ? [config.breakDownBy] : []);
  const [stacked, setStacked] = useState<boolean>(config.stacked);
  const [grouping, setGrouping] = useState<HistogramGrouping>(config.grouping);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'scatter'>(config.chartType);
  const [attributeDescriptor, setAttributeDescriptor] = useState<any>(null);
  const [chartDataType, setChartDataType] = useState<string>("");

  const CHART_TYPES = ['bar', 'line', 'scatter']
  const INTERVALS: IIntervalListItem[] = [
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
  const hasUpdated = (
    xAxis[0] !== config.xAxis ||
    breakDownBy[0] !== config.breakDownBy ||
    stacked !== config.stacked ||
    (chartDataType === "datetime" ? grouping !== config.grouping : false) ||
    chartType !== config.chartType
  );
  const hasRequiredFields = xAxis.length > 0 && breakDownBy.length > 0;
  const hasPendingChanges = hasUpdated && hasRequiredFields;

  useEffect(() => {
    if (open) {
      setXAxis(config.xAxis ? [config.xAxis] : []);
      setBreakDownBy(config.breakDownBy ? [config.breakDownBy] : []);
      setStacked(config.stacked);
      setGrouping(config.grouping);
      setChartType(config.chartType);
    }
  }, [open]);

  useEffect(() => {
    if (attributeDescriptor) {
      const firstKey = Object.keys(attributeDescriptor)[0];
      setChartDataType(attributeDescriptor[firstKey]?.python_type);
    }
  }, [attributeDescriptor]);

  const onSave = () => {
    const updatedConfig: IChartConfig = {
      breakDownBy: breakDownBy[0],
      stacked: stacked,
      grouping: chartDataType === "datetime" ? grouping : "categorical",
      xAxis: xAxis[0],
      chartType: chartType,
    };
    onConfigSave(updatedConfig);
  };

  const IntervalButtons = (
    <div className="tol-board-chart-interval-btn-container">
      {INTERVALS.map((interval: IIntervalListItem) => (
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
      {CHART_TYPES.map((type: 'bar' | 'line' | 'scatter') => (
        <Button
          outline
          key={type}
          text={normaliseCaps(type)}
          type="primary"
          onClick={() => {
            setChartType(type)
            if (type !== "bar") {
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

  return (
    <Drawer
      title={title}
      open={open}
      setOpen={setOpen}
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      <h6>
        Chart Type
        <RequiredAsterisk />
      </h6>
      {ChartTypeButtons}
      <>
        <h6>
          X Axis
          <RequiredAsterisk />
        </h6>
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
          setAttributeMeta={setAttributeDescriptor}
        />
      </>
      {chartDataType === "datetime" && (
        <>
          <h6>
            Interval
            <RequiredAsterisk />
          </h6>
          {IntervalButtons}
        </>
      )}
      <>
        <div className="tol-board-chart-xaxis-container">
          <h6 className="tol-board-chart-xaxis-title">
            Break Down By
            <RequiredAsterisk />
          </h6>
          <IconTooltip contents={
            "Note: This list has been filtered by cardinality." +
            "This is the number of available values for a given attribute." +
            "It has been set to max 25 to avoid charts becoming unreadable."} />
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
      </>
      {chartType == "bar" && (
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
      )}
    </Drawer>
  );
}
