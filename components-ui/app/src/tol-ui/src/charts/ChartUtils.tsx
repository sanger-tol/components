/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { normaliseCaps } from '../general/Utils'


interface Rgb {
  [key: string]: number,
  r: number,
  g: number,
  b: number
}

interface ChartData {
  datasets: object[],
  labels: string[]
}

// bootstrap colours
export const bsColours = [
  '--blue-400',
  '--indigo-400',
  '--pink-400',
  '--orange-400',
  '--red-400',
  '--yellow-400',
  '--green-400',
  '--cyan-400',
  '--teal-400',

  '--blue-700',
  '--indigo-700',
  '--pink-700',
  '--orange-700',
  '--red-700',
  '--yellow-700',
  '--green-700',
  '--cyan-700',
  '--teal-700',
]

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16)
  }
}

function incrementRgbColour(rgb: Rgb) {
  for (const [key, value] of Object.entries(rgb)) {
    if (value > 255) {
      rgb[key] = 255
    } else {
      rgb[key] = value + 75
    }
  }
  return rgb
}

function rgbToString(rgb: Rgb, opacity: number) {
  return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity.toString() + ")"
}

export function getCssVarColour(variable: string) {
  return getComputedStyle(
    document.documentElement
  ).getPropertyValue(
    variable
  );
}

export function getColourFromCssVar(cssVar: string) {
  return rgbToString(
    hexToRgb(
      getCssVarColour(cssVar)
    ), 1
  );
}

export function getFadedColourFromCssVar(cssVar: string) {
  return rgbToString(
    incrementRgbColour(
      hexToRgb(
        getCssVarColour(cssVar)
      )
    ), 0.25
  );
}

export function initialiseDatasets(datasets: any[]) {
  for (let index = 0; index < datasets.length; index++) {
    const bgColour = getColourFromCssVar(bsColours[index])
    datasets[index]["backgroundColor"] = []
    datasets[index]["hoverBackgroundColor"] = []
    const dataLength = datasets[index].data.length
    for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
      datasets[index]["backgroundColor"].push(bgColour)
      datasets[index]["hoverBackgroundColor"].push(bgColour)
    }
  }
  return datasets
}

// needs adapting for multiple aggs in one api call (if required)
export function aggsToChartData(aggs: object): ChartData {
  const labels: string[] = []
  const datasets: object[] = []
  for (const agg of Object.values(aggs)) {
    const buckets: object = agg["buckets"]
    let labelsAdded = false
    for (const bucket of Object.values(buckets)) {
      const dataset: object = {
        id: bucket["key"],
        label: normaliseCaps(bucket["key"]),
        data: []
      }
      const data: object[] = bucket["1"]["buckets"]
      for (const datapoint of Object.values(data)) {
        dataset["data"].push(datapoint["doc_count"])
        // only adding labels from 1 bucket - they're the same across all
        if (!labelsAdded) {
          labels.push(datapoint["key_as_string"])
        }
      }
      datasets.push(dataset)
      labelsAdded = true
    }
    break
  }
  return {
    datasets: datasets,
    labels: labels
  } as ChartData
}
