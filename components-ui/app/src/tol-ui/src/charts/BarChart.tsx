/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { MouseEvent, useRef } from "react";
import type { InteractionItem } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, getElementAtEvent, getDatasetAtEvent } from "react-chartjs-2";
import { getChartColour,
         getCssVarColour,
         initialiseDatasets } from "./ChartUtils"


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  stacked?: boolean,
  title: string,
  labels: string[],
  datasets: any[],
  setBarData?: React.Dispatch<React.SetStateAction<any>>
}

function BarChart(props: Props) {
  // colours
  const labelsAndGridColour = getCssVarColour("--bs-body-color")
  const gridLineColour = getCssVarColour("--bs-secondary-bg")
  
  // not stacked by default
  let stacked = true
  if (props.stacked === undefined) {
    stacked = false
  }

  // data and options
  const data = {
    labels: props.labels,
    datasets: initialiseDatasets(props.datasets)
  }
  const options = {
    plugins: {
      title: {
        display: true,
        text: props.title,
        color: labelsAndGridColour
      },
      // Keeping the key box colours the same
      // https://www.youtube.com/watch?v=0VcybDX-kk0
      legend: {
        // @ts-ignore
        onClick: (event: any, legendItem: any, legend: any) => {
          // @ts-ignore
          const datasets = legend.legendItems.map((dataset: any, index: any) => {
            return dataset.text
          });
          const index = datasets.indexOf(legendItem.text);
          if (legend.chart.isDatasetVisible(index) === true) {
            // legend.chart.hide(index);
          } else {
            // legend.chart.show(index);
          }
        },
        labels: {
          generateLabels: (chart: any) => {
            let visibility: boolean[] = [];
            for (let index = 0; index < chart.data.datasets.length; index++) {
              if (chart.isDatasetVisible(index) === false) {
                visibility.push(true)
              } else {
                visibility.push(false)
              }
            }

            return chart.data.datasets.map(
              (dataset: any, index: any) => {
                return {
                  text: dataset.label,
                  fillStyle: getChartColour(index),
                  fontColor: labelsAndGridColour,
                  hidden: visibility[index]
                }
              }
            )
          }
        }
      }
    },
    // changing the bar colours to faded or back to solid
    // @ts-ignore
    onClick: (event: any, chartElement: any, chart: any) => {
      if (!chartElement.length) {
        // reset bar colours when clicking other part of chart
        for (let index = 0; index < chart.data.datasets.length; index++) {
          const solidColour = getChartColour(index)
          const fadedColour = getChartColour(index, 0.75)
          chart.data.datasets[index]["backgroundColor"] = []
          chart.data.datasets[index]["hoverBackgroundColor"] = []
          const dataLength = chart.data.datasets[index].data.length
          for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
            chart.data.datasets[index]["backgroundColor"].push(solidColour)
            chart.data.datasets[index]["hoverBackgroundColor"].push(fadedColour)
          }
        }
      } else {
        // fade non-clicked bars
        for (let index = 0; index < chart.data.datasets.length; index++) {
          const solidColour = getChartColour(index)
          const fadedColour = getChartColour(index, 0.25)
          chart.data.datasets[index]["backgroundColor"] = []
          chart.data.datasets[index]["hoverBackgroundColor"] = []
          const dataLength = chart.data.datasets[index].data.length
          for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
            chart.data.datasets[index]["backgroundColor"].push(fadedColour)
            chart.data.datasets[index]["hoverBackgroundColor"].push(solidColour)
          }
        }
        // setting clicked bar as its original colour
        const { datasetIndex, index } = chartElement[0];
        const originalColour = getChartColour(datasetIndex)
        chart.data.datasets[datasetIndex].backgroundColor[index] = originalColour
        chart.data.datasets[datasetIndex].hoverBackgroundColor[index] = originalColour
      }
      chart.update();
    },
    onHover: (event: any, chartElement: any) => {
      if (chartElement.length === 1) {
        event.native.target.style.cursor = "pointer";
      } else if (chartElement.length === 0) {
        event.native.target.style.cursor = "default";
      }
    },
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: false
        },
        ticks: { // x labels
          color: labelsAndGridColour
        }
      },
      y: {
        stacked: stacked,
        grid: {
          color: gridLineColour
        },
        ticks: { // y labels
          color: labelsAndGridColour
        }
      },
    },
    responsive: true
  }

  // making chart "clickable"
  const chartRef = useRef<ChartJS>();

  const getBarDataAtEvent = (element: InteractionItem[]) => {
    if (!element.length) return;
    const { datasetIndex, index } = element[0];
    return [data.labels[index], data.datasets[datasetIndex].data[index]];
  }

  const getDatasetNameAtEvent = (dataset: InteractionItem[]) => {
    if (!dataset.length) return;
    const datasetIndex = dataset[0].datasetIndex;
    return data.datasets[datasetIndex].id;
  };

  const getBarData = (event: MouseEvent<HTMLCanvasElement>) => {
    let elementData = getBarDataAtEvent(
      getElementAtEvent(chartRef.current!, event)
    );
    elementData?.push(getDatasetNameAtEvent(
      getDatasetAtEvent(chartRef.current!, event)
    ));
    return elementData
  }

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const barData = getBarData(event);
    if (barData !== undefined) {
      // sets 'clicked' bar data
      props.setBarData!({
        "bucket": barData[2],
        "value": barData[1],
        "xKey": barData[0]
      })
    } else {
      // clears 'clicked' bar data
      props.setBarData!({})
    }
  }

  return (
    <Bar
      id="tol-bar-chart"
      datasetIdKey="id"
      options={ options }
      data={ data }
      // @ts-ignore
      ref={ chartRef }
      onClick={ onClick }
    />
  )
}

export default BarChart;
