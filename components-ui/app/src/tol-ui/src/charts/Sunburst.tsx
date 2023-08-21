/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend } from 'chart.js';

import { Doughnut } from "react-chartjs-2";
import { generateSunburstLabels, 
         convertSunburstDatasets } from "./ChartUtils"
import { getCssVarValue } from "../general/Utils"


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  title: string,
  datasets: object,
  height: number
}

function Sunburst(props: Props) {
  const { title, datasets, height } = props
  const data = {
    datasets: convertSunburstDatasets(datasets)
  }

  // colours
  const titleColour = getCssVarValue("--bs-emphasis-color")

  // sunburst options
  const options = {
    maintainAspectRatio: false,
    cutout: "20%",
    plugins: {
      title: {
        display: true,
        text: title,
        color: titleColour
      },
      // tooltip styling
      tooltip: {
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          title: (context: any) => {
            const dataPointIndex = context[0].dataIndex
            const labels = context[0].dataset.labels
            const value = context[0].formattedValue
            const percentages = context[0].dataset.percentages
            return `${labels[dataPointIndex]}: ${value} (${percentages[dataPointIndex]}%)`
          },
          label: (context: any) => {
            const label = context.dataset.label
            return " " + label
          },
          labelPointStyle: () => {
            return {
              pointStyle: 'rectRounded',
              rotation: 0
            }
          },
          labelColor: (context: any) => {
            const index = context.dataIndex
            const colour = context.dataset.backgroundColor[index]
            return {
              backgroundColor: colour,
              borderColor: colour
            };
          },
        }
      },
      legend: {
        position: "bottom",
        onClick: null,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateSunburstLabels(chart, titleColour)
          }
        }
      }
    }
  }

  return (
    <div style={{height: height.toString() + 'px'}}>
      <Doughnut
        responsive="true"
        id="tol-sunburst"
        className="tol-sunburst"
        datasetIdKey="id"
        // @ts-ignore
        options={ options }
        data={ data }
      />
    </div>
  )
}

export default Sunburst;
