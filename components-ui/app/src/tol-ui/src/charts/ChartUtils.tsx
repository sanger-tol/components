/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns'


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

interface AggData {
  keys: any[],
  aggs: object[]
}

export type DateInterval = "d"|"w"|"M"|"y"

export const colours = [
  {r: 50, g: 150, b: 233}, // light blue
  {r: 111, g: 72, b: 192}, // light purple
  {r: 199, g: 90, b: 144}, // light pink
  {r: 194, g: 63, b: 58}, // light red
  {r: 231, g: 125, b: 26}, // light orange
  {r: 240, g: 190, b: 30}, // light yellow
  {r: 84, g: 146, b: 109}, // light green
  {r: 120, g: 214, b: 240}, // cyan
  {r: 165, g: 171, b: 180}, // grey

  {r: 28, g: 28, b: 28}, // dark grey

  {r: 30, g: 45, b: 120}, // dark blue
  {r: 36, g: 20, b: 75}, // dark purple
  {r: 119, g: 26, b: 68}, // dark pink
  {r: 120, g: 0, b: 5}, // dark red
  {r: 60, g: 30, b: 0}, // dark orange
  {r: 100, g: 90, b: 20}, // dark yellow
  {r: 0, g: 37, b: 10}, // dark green
  {r: 17, g: 35, b: 40}, // dark cyan
]

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16)
  }
}

export function incrementRgbColour(rgb: Rgb) {
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

export function getColourFromCssVar(cssVar: string, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1
  }
  return rgbToString(
    hexToRgb(
      getCssVarColour(cssVar)
    ), opacity
  );
}

export function getChartColour(index: number, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1
  }
  const rgb = colours[index]
  return rgbToString(rgb, opacity)
}

export function initialiseDatasets(datasets: any[]) {
  for (let index = 0; index < datasets.length; index++) {
    const bgColour = getChartColour(index)
    const fadedColour = getChartColour(index, 0.75)
    datasets[index]["backgroundColor"] = []
    datasets[index]["hoverBackgroundColor"] = []
    const dataLength = datasets[index].data.length
    for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
      datasets[index]["backgroundColor"].push(bgColour)
      datasets[index]["hoverBackgroundColor"].push(fadedColour)
    }
  }
  return datasets
}


function getSortedAggData(buckets: object) {
  const keys = new Set()
  const aggs = {}
  for (const bucket of Object.values(buckets)) {
    aggs[bucket["key"]] = {}
    const data: object[] = bucket["1"]["buckets"]
    for (const datapoint of data) {
      keys.add(datapoint["key"])
      aggs[bucket["key"]][datapoint["key"]] = datapoint["doc_count"]
    }
  }
  return {
    keys: Array.from(keys).sort(),
    aggs: aggs
  } as AggData
}

function formatLabels(labels: string[], interval: DateInterval) {
  const formattedLabels: string[] = []
  let dateFormat: string
  switch(interval) {
    case "d":
    case "w":
      dateFormat = "dd LLLL yyyy"
      break
    case "M":
      dateFormat = "LLLL yyyy"
      break
    case "y":
      dateFormat = "yyyy"
      break
  }
  for (const label of labels) {
    const date = new Date(label)
    formattedLabels.push(
      format(date, dateFormat)
    )
  }
  return formattedLabels
}

// would need adapting for multiple aggs in 1 api call
export function aggsToChartData(aggs: object, interval: DateInterval): ChartData {
  const datasets: object[] = []
  const buckets: object = aggs["agg"]["buckets"]
  const sortedAggs: AggData = getSortedAggData(buckets)
  const labels = sortedAggs.keys

  for (let [bucket, agg] of Object.entries(sortedAggs.aggs)) {
    const data: number[] = []

    // create datapoint list - must be in the order of the labels
    for (const key of sortedAggs.keys) {
      if (key in agg) {
        data.push(agg[key])
      } else {
        data.push(0)
      }
    }
    const dataset = {
      id: bucket,
      label: bucket,
      data: data
    }
    datasets.push(dataset)
  }

  return {
    datasets: datasets,
    labels: formatLabels(labels, interval)
  } as ChartData
}

export function formatDateRangeWithInterval(date: string, interval: string) {
  const from = new Date(date)
  const to = new Date(date)
  switch(interval) {
    case "d":
      to.setDate(to.getDate() + 1)
      break
    case "w":
      to.setDate(to.getDate() + 7)
      break
    case "M":
      to.setMonth(to.getMonth() + 1)
      break
    case "y":
      to.setFullYear(to.getFullYear() + 1)
      break
  }
  if (from.toString() === 'Invalid Date') {
    return false
  }
  return {from: from, to: to}
}