/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { UtilityBar } from "../index";
import {
  getChartColour,
  initialiseDatasets,
  updateChartColours,
  setClickedColourToSolid,
  setBarClickedData,
  generateBarLabels,
  updateOpacitys,
  resetItemClickedData,
  downloadItem,
} from "./utils";
import { isPropDefined, getCssVarValue } from "../general/utils";
import { themeListener } from "../hooks/listeners";
import { IUtilityBar } from "../general/UtilityBar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

interface Props {
  id: string;
  stacked?: boolean;
  downloadName?: string;
  labels: string[];
  datasets: any[];
  height?: any;
  setBarData?: any;
  cumulative?: boolean;
  buttons?: JSX.Element[];
  utilityBarConfig?: IUtilityBar;
  contents?: ReactNode;
  chartType?: string;
}

function BarChart(props: Props) {
  const { id, labels, setBarData, cumulative, utilityBarConfig = {}, contents, chartType='bar' } = props;
  const height = props.height !== undefined ? props.height : "100%";
  const stacked = props.stacked !== undefined ? props.stacked : false;
  const originDatasets = initialiseDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);

  const [prevOrder, setPrevOrder] = useState(null);
  const [prevLegendItemIndex, setPrevLegendItemIndex] = useState(null);
  // Used to change the height of the y-axis when selecting a legend
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  // colours
  const [titleColour, setTitleColour] = useState("");
  const [labelColour, setLabelColour] = useState("");
  const [gridColour, setGridColour] = useState("");
  themeListener(() => {
    setTitleColour(getCssVarValue("--tol-emphasis"));
    setLabelColour(getCssVarValue("--tol-text"));
    setGridColour(getCssVarValue("--tol-grey"));
  });

  //making sure legendclick is disabled when cumulative toggle is on
  const isInteractive = !cumulative && isPropDefined(setBarData);

  useEffect(() => {
    setDatasets(initialiseDatasets(props.datasets));
  }, [props.datasets]);

  // functions for options
  function handleLegendClick(event: any, legendItem: any, legend: any) {
    if (isInteractive) {
      const legendIndex = event.chart.data.datasets.findIndex(
        (obj: any) => obj.label === legendItem.text,
      );
      let selectedBucket = null;

      // cannot keep clicking on the same legend item
      if (prevLegendItemIndex !== legendIndex) {
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          if (index === legendIndex) {
            dataset.backgroundColor = updateOpacitys(
              dataset.backgroundColor,
              "1",
            );
            setPrevOrder(dataset.order);
            setPrevLegendItemIndex(index);
            dataset.order = -1;
            selectedBucket = dataset.id;
            const maxValue = Math.max(...dataset.data);
            const maxValuePercentage = Math.ceil(maxValue * 1.1);
            setMaxHeight(maxValuePercentage);
          } else {
            dataset.backgroundColor = updateOpacitys(
              dataset.backgroundColor,
              "0.25",
            );
            // reset prev item's order
            if (prevLegendItemIndex === index) {
              dataset.order = prevOrder;
            }
          }
        });
        // sets the bar data to the selected legend
        setBarData!({
          bucket: selectedBucket,
          value: null,
          clickKey: null,
        });
      } else {
        setMaxHeight(null);
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          dataset.backgroundColor = updateOpacitys(
            dataset.backgroundColor,
            "1",
          );
          setPrevOrder(null);
          setPrevLegendItemIndex(null);
          dataset.order = index;
        });
        // sets the bar data to the selected legend
        setBarData!({});
      }
      legend.chart.update();
      setDatasets(legend.chart.data.datasets);
    }
  }

  function handleLegendHover(event: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = "pointer";
    }
  }

  function handlePlaneClick(
    // @ts-ignore
    event: any,
    chartElement: any,
    chart: any,
    item: any,
  ) {
    setMaxHeight(null);
    if (item !== undefined) {
      return;
    }

    // reset order on 'plane reset click'
    if (prevLegendItemIndex !== null) {
      chart.data.datasets[prevLegendItemIndex].order = prevOrder;
      setPrevOrder(null);
      setPrevLegendItemIndex(null);
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setBarData)) {
      if (!chartElement.length) {
        // reset bar colours when clicking any other part of chart
        updateChartColours(chart, true, 0.5);
        resetItemClickedData(setBarData);
      } else {
        // fade non-clicked bars
        updateChartColours(chart, false, 0.25);
        // setting clicked bar as its original colour
        setClickedColourToSolid(chart, chartElement);
        setBarClickedData(chart, chartElement, setBarData);
      }
      chart.update();
    }
    setDatasets(chart.data.datasets);
  }

  function handlePlaneHover(event: any, chartElement: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
    }
  }

  // chart options
  const options = {
    animation: false,
    maintainAspectRatio: false,
    responsive: true,
    devicePixelRatio: 2,
    showLine: chartType !== "scatter",
    plugins: {
      title: {},
      tooltip: {
        animation: false,
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          labelPointStyle: () => {
            return {
              pointStyle: "rectRounded",
              rotation: 0,
            };
          },
          labelColor: (context: any) => {
            const colour = getChartColour(context.datasetIndex);
            return {
              backgroundColor: colour,
              borderColor: colour,
            };
          },
        },
      },
      legend: {
        onHover: handleLegendHover,
        onClick: handleLegendClick,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateBarLabels(chart, titleColour);
          },
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        bottom: 10,
      },
    },
    onClick: handlePlaneClick,
    onHover: handlePlaneHover,
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: false,
        },
        ticks: {
          // x labels
          color: labelColour,
        },
      },
      y: {
        stacked: stacked,
        max: maxHeight,
        grid: {
          color: gridColour,
        },
        ticks: {
          // y labels
          color: labelColour,
        },
      },
    },
  };

  const downloadName =
    props.downloadName !== undefined ? props.downloadName : "barchart";

  return (
    <div style={{ height: height }}>

      <UtilityBar
        id={id}
        title={utilityBarConfig.title}
        buttons={[
          {
            outline: true,
            position: "right",
            type: "primary",
            onClick: () => {
              resetItemClickedData(setBarData);
              setMaxHeight(null);
              setDatasets(originDatasets);
            },
            icon: "undo",
            visible: isPropDefined(setBarData),
          },
          {
            outline: true,
            position: "right",
            type: "primary",
            onClick: () => {
              downloadItem(props.id, downloadName);
            },
            icon: "download",
            disabled: datasets.length === 0,
          },
          ...(utilityBarConfig.buttons || []),
        ]}
      />

      {contents ?
        contents
        :
        <Chart
          type={chartType === "scatter" ? "line" : chartType}
          id={id}
          responsive="true"
          className="tol-bar-chart"
          datasetIdKey="id"
          // @ts-ignore
          options={options}
          data={{
            labels: labels,
            datasets: datasets,
          }}
        />
      }
    </div>
  );
}

export default BarChart;
