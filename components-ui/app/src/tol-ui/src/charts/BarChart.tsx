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
  Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { getChartColour,
         initialiseDatasets,
         updateChartColours,
         setClickedColourToSolid,
         setBarClickedData,
         generateBarLabels,
         updateOpacitys,
         resetItemClickedData } from "./ChartUtils"
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
  title?: string,
  labels: string[],
  datasets: any[],
  height: number,
  setBarData?: React.Dispatch<React.SetStateAction<any>>
}

function BarChart(props: Props) {
  const { title, datasets, labels, height, setBarData } = props
  const stacked = isPropDefined(props.stacked)

  // for keeping track of the legends click and order
  const [prevOrder, setPrevOrder] = useState(null)
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
      const legendIndex = event.chart.data.datasets.findIndex((obj: any) => obj.label === legendItem.text)
      let selectedBucket = null

      // cannot keep clicking on the same legend item
      if (prevLegendItemIndex !== legendIndex) {
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          if (index === legendIndex) {
            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1')
            setPrevOrder(dataset.order)
            setPrevLegendItemIndex(index)
            dataset.order = -1
            selectedBucket = dataset.id
          } else {
            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '0.25')
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
          "clickKey": null
        })
      }
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
      setPrevOrder(null)
      setPrevLegendItemIndex(null)
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setBarData)) {
      if (!chartElement.length) {
        // reset bar colours when clicking other any part of chart
        updateChartColours(chart, true, 0.5)
        resetItemClickedData(setBarData)
      } else {
        // fade non-clicked bars
        updateChartColours(chart, false, 0.25)
        // setting clicked bar as its original colour
        setClickedColourToSolid(chart, chartElement)
        setBarClickedData(chart, chartElement, setBarData)
      }
      chart.update();
    }
  }

  function handlePlaneHover (event: any, chartElement: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = chartElement[0] ? "pointer" : "default"
    }
  }

  // chart options
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: title !== undefined,
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
      />
    </div>
  )
}

export default BarChart;
