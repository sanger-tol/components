/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getChartColour,
         initialiseDatasets,
         updateBarColours,
         setBarClickedDataAndColour, 
         generateBarLabels,
         updateOpacity,
         resetBarClickedData } from "./ChartUtils"
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

  // for keeping track of the legends click and order
  const [prevOrder, setPrevOrder] = useState(0)
  const [prevLegendItemIndex, setPrevLegendItemIndex] = useState(null)

  const data = {
    labels: labels,
    datasets: initialiseDatasets(datasets)
  }

  // colours
  const titleColour = getCssVarValue("--bs-emphasis-color")
  const labelsAndGridColour = getCssVarValue("--bs-body-color")
  const gridLineColour = getCssVarValue("--bs-secondary-bg")

  // functions for options
  function handleLegendClick(event: any, legendItem: any, legend: any) {
    if (isPropDefined(setBarData)) {
      const legendIndex = event.chart.data.datasets.findIndex(obj => obj.label === legendItem.text)
      let selectedBucket = null

      legend.chart.data.datasets.forEach((dataset, index) => {
        if (index === legendIndex) {
          dataset.backgroundColor = updateOpacity(dataset.backgroundColor, '1')
          setPrevOrder(dataset.order)
          setPrevLegendItemIndex(index)
          dataset.order = -1
          selectedBucket = dataset.id
        } else {
          dataset.backgroundColor = updateOpacity(dataset.backgroundColor, '0.25')
          // reset prev item's order
          if (prevLegendItemIndex === index) {
            dataset.order = prevOrder
          }
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

  function handleLegendHover(event: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = 'pointer'
    }
  }

  // @ts-ignore
  function handlePlaneClick(event: any, chartElement: any, chart: any, item: any) {
    if (item !== undefined) {
      return
    }

    // reset order on 'plane reset click'
    if (prevLegendItemIndex !== null) {
      chart.data.datasets[prevLegendItemIndex].order = prevOrder
      setPrevOrder(0)
      setPrevLegendItemIndex(null)
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setBarData)) {
      if (!chartElement.length) {
        // reset bar colours when clicking other any part of chart
        updateBarColours(chart, true, 0.5)
        resetBarClickedData(setBarData)
      } else {
        // fade non-clicked bars
        updateBarColours(chart, false, 0.25)
        // setting clicked bar as its original colour
        setBarClickedDataAndColour(chart, chartElement, setBarData)
      }
      chart.update();
    }
  }

  function handlePlaneHover (event: any, chartElement: any) {
    if (isPropDefined(setBarData)) {
      if (chartElement.length === 1) {
        event.native.target.style.cursor = "pointer";
      } else if (chartElement.length === 0) {
        event.native.target.style.cursor = "default";
      }
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
        onHover: handleLegendHover,
        onClick: handleLegendClick,
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
    onClick: handlePlaneClick,
    onHover: handlePlaneHover,
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
      />
    </div>
  )
}

export default BarChart;
