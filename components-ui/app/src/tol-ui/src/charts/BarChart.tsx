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
         initialiseDatasets,
         updateBarColours,
         setBarFilled, 
         generateBarLabels,
         updateOpacity } from "./ChartUtils"
import { isPropDefined, getCssVarValue } from "../general/Utils";


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
  height: number,
  setBarData?: React.Dispatch<React.SetStateAction<any>>
}

function BarChart(props: Props) {
  const { title, datasets, labels, height, setBarData } = props
  const stacked = isPropDefined(props.stacked)

  const data = {
    labels: labels,
    datasets: initialiseDatasets(datasets)
  }

  // colours
  const titleColour = getCssVarValue("--bs-emphasis-color")
  const labelsAndGridColour = getCssVarValue("--bs-body-color")
  const gridLineColour = getCssVarValue("--bs-secondary-bg")

  // functions for options
  function handleHover(event) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = 'pointer'
    }
  }

  function handleClick(event, legendItem, legend) {
    if (isPropDefined(setBarData)) {
      const legendIndex = event.chart.data.datasets.findIndex(obj => obj.label === legendItem.text)
      let selectedBucket = null

      legend.chart.data.datasets.forEach((dataset, index) => {
        if (index === legendIndex) {
          dataset.backgroundColor = updateOpacity(dataset.backgroundColor, '1')
          selectedBucket = dataset.id
        } else {
          dataset.backgroundColor = updateOpacity(dataset.backgroundColor, '0.20')
        }
      })
      
      // sets the bar data to the selected legend
      setBarData!({
        "bucket": selectedBucket,
        "value": null,
        "xKey": null
      })

      legend.chart.update()
    }
  }

  // chart options
  const options = {
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        color: titleColour
      },
      tooltip: {
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          labelPointStyle: () => {
            return {
              pointStyle: 'rectRounded',
              rotation: 0
            }
          },
          labelColor: (context: any) => {
            const colour = getChartColour(context.datasetIndex)
            return {
              backgroundColor: colour,
              borderColor: colour
            };
          },
        }
      },
      legend: {
        onHover: handleHover,
        onClick: handleClick,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateBarLabels(chart, titleColour)
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        bottom: 10
      }
    },
    // changing the bar colours to faded or back to solid
    // @ts-ignore
    onClick: (event: any, chartElement: any, chart: any, item: any) => {
      if (item !== undefined) {
        return
      }

      // only clickable if setBarData is defined
      if (isPropDefined(setBarData)) {
        if (!chartElement.length) {
          // reset bar colours when clicking other any part of chart
          updateBarColours(chart, true, 0.5)
        } else {
          // fade non-clicked bars
          updateBarColours(chart, false, 0.25)
          // setting clicked bar as its original colour
          setBarFilled(chart, chartElement)
        }
        chart.update();
      }
    },
    onHover: (event: any, chartElement: any) => {
      if (isPropDefined(setBarData)) {
        if (chartElement.length === 1) {
          event.native.target.style.cursor = "pointer";
        } else if (chartElement.length === 0) {
          event.native.target.style.cursor = "default";
        }
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

  const onPlaneClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const barData = getBarData(event);
    if (isPropDefined(setBarData)) {
      if (barData !== undefined) {
        // sets 'clicked' bar data
        setBarData!({
          "bucket": barData[2],
          "value": barData[1],
          "xKey": barData[0]
        })
      } else {
        // clears 'clicked' bar data
        setBarData!({})
      }
    }
  }

  return (
    <div style={{height: height.toString() + 'px'}}>
      <Bar
        responsive="true"
        id="tol-bar-chart"
        className="tol-bar-chart"
        datasetIdKey="id"
        // @ts-ignore
        options={ options }
        data={ data }
        // @ts-ignore
        ref={ chartRef }
        onClick={ onPlaneClick }
      />
    </div>
  )
}

export default BarChart;
