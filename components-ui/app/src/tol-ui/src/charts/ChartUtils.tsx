/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns'


// ------------------//
//      GENERAL      //
// ------------------//

interface Rgb {
  [key: string]: number,
  r: number,
  g: number,
  b: number
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

// ------------------//
//      BARCHART     //
// ------------------//

interface ChartData {
  datasets: object[],
  labels: string[]
}

interface AggData {
  keys: any[],
  aggs: object[]
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
    keys: Array.from(keys).sort((a: any, b: any) => {return a-b}),
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

export function updateBarColours(chart: any, resetColours: boolean, fadedOpacity: number) {
  for (let index = 0; index < chart.data.datasets.length; index++) {
    const solidColour = getChartColour(index)
    const fadedColour = getChartColour(index, fadedOpacity)
    chart.data.datasets[index]["backgroundColor"] = []
    chart.data.datasets[index]["hoverBackgroundColor"] = []
    const dataLength = chart.data.datasets[index].data.length
    for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
      if (resetColours) {
        chart.data.datasets[index]["backgroundColor"].push(solidColour)
        chart.data.datasets[index]["hoverBackgroundColor"].push(fadedColour)
      } else {
        chart.data.datasets[index]["backgroundColor"].push(fadedColour)
        chart.data.datasets[index]["hoverBackgroundColor"].push(solidColour)
      }
    }
  }
}

export function setBarFilled(chart: any, chartElement: any) {
  const { datasetIndex, index } = chartElement[0]
  const originalColour = getChartColour(datasetIndex)
  chart.data.datasets[datasetIndex].backgroundColor[index] = originalColour
  chart.data.datasets[datasetIndex].hoverBackgroundColor[index] = originalColour
}

export function generateBarLabels(chart: any, titleColour: any) {
  return chart.data.datasets.map(
    (dataset: any, index: any) => {
      return {
        text: dataset.label,
        fillStyle: getChartColour(index),
        fontColor: titleColour,
        pointStyle: 'rectRounded',
        lineWidth: 0
      }
    }
  )
}

// returns true if object already exists in array
export function objectExists(existingObjects: any, object: any): boolean {
  return existingObjects.some((obj) => {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        if (obj[key] !== object[key]) {
          return false; // mismatch found
        }
      }
    }
    return true; // all properties match
  });
}

// ------------------//
//      SUNBURST     //
// ------------------//

interface SunburstData {
  key: string,
  value: number,
  child?: object
}

interface DoughnutDataCJS {
  data: number[],
  total: number,
  percentages: string[]
  label: string,
  labels: string[],
  backgroundColor: string[],
  hoverBackgroundColor: string[],
  borderColor: string,
  borderWidth: number,
  hoverOffset: number
}

export function convertSunburstDatasets(
  datasets: object,
  outputData?: DoughnutDataCJS[],
  colourIndex?: number,
  depth?: number
) {

  // set defaults if undefined
  if (outputData === undefined) outputData = []
  if (colourIndex === undefined) colourIndex = 0
  if (depth === undefined) {
    depth = 0
  } else {
    depth++
  }
  // key of what the doughnut is sliced by
  const key = Object.keys(datasets)[0]
  // the data of the slices
  const buckets: SunburstData[] = datasets[key]
  // only append the origin dict on the first iteration
  initialiseOriginDataset(outputData, key, colourIndex, depth)

  for (const bucket of buckets) {
    const colour = getChartColour(colourIndex)
    const hoverColour = getChartColour(colourIndex, 0.5)
    outputData![depth].data.push(bucket.value)
    outputData![depth].total += bucket.value
    outputData![depth].backgroundColor.push(colour)
    outputData![depth].hoverBackgroundColor.push(hoverColour)
    outputData![depth].labels.push(bucket.key)
    if (bucket.child) {
      outputData = convertSunburstDatasets(bucket.child, outputData, colourIndex, depth)
    }
    // keep colour the same for children
    if (depth === 0) {
      colourIndex++
    }
  }
  // reverse final output (chartJS requires inner doughnut to be end of list)
  if (depth === 0) return addPercentages(outputData!.reverse())
  return outputData
}

function initialiseOriginDataset(
  outputData: DoughnutDataCJS[],
  key: string,
  colourIndex: number,
  depth: number
) {
  if (colourIndex === 0 && outputData.length === depth) {
    outputData.push({
      data: [],
      total: 0,
      percentages: [],
      label: key,
      labels: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
      borderColor: getCssVarColour("--bs-body-bg"),
      borderWidth: 1.5,
      hoverOffset: 0
    })
  }
}

function addPercentages(outputData: DoughnutDataCJS[]) {
  for (const entry of outputData) {
    for (const dataPoint of entry.data) {
      const percentage = (dataPoint/entry.total)*100
      entry.percentages.push(percentage.toFixed(1))
    }
  }
  return outputData
}

export function generateSunburstLabels(chart: any, titleColour: any) {
  // parent is end of list due to chartJS oddities
  const parentIndex = chart.data.datasets.length-1
  return chart.data.datasets[parentIndex].labels.map(
    (label: any, index: any) => {
      return {
        text: label,
        fillStyle: getChartColour(index),
        fontColor: titleColour,
        pointStyle: 'rectRounded',
        lineWidth: 0
      }
    }
  )
}