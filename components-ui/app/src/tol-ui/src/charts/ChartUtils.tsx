/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from 'date-fns';
import { normaliseCaps, getCssVarValue, isPropDefined } from '../general/Utils';


// ------------------//
//      GENERAL      //
// ------------------//

interface Rgb {
  [key: string]: number,
  r: number,
  g: number,
  b: number
}

/*
useful for creating rgb colours based on hsl
https://www.rapidtables.com/convert/color/hsl-to-rgb.html
{r: one, g: two, b: two}, // 0
{r: one, g: three, b: two}, // 30
{r: one, g: one, b: two}, // 60
{r: three, g: one, b: two}, // 90
{r: two, g: one, b: two}, // 120
{r: two, g: one, b: three}, // 150
{r: two, g: one, b: one}, // 180
{r: two, g: three, b: one}, // 210
{r: two, g: two, b: one}, // 240
{r: three, g: two, b: one}, // 270
{r: one, g: two, b: one}, // 300
{r: one, g: two, b: three}, // 330
*/


export const colours = [
  // 90/70 - 247, 110, 179
  // {r: 110, g: 247, b: 247}, // 180
  {r: 3, g: 155, b: 229}, // 210 >> {r: 110, g: 179, b: 247}
  // {r: 110, g: 110, b: 247}, // 240
  {r: 179, g: 110, b: 247}, // 270
  // {r: 247, g: 110, b: 247}, // 300
  {r: 247, g: 110, b: 179}, // 330
  // {r: 247, g: 110, b: 110}, // 0
  {r: 247, g: 179, b: 110}, // 30
  // {r: 247, g: 247, b: 110}, // 60
  {r: 179, g: 247, b: 110}, // 90
  // {r: 110, g: 247, b: 110}, // 120
  {r: 110, g: 247, b: 179}, // 150

  // 85/75 - 245, 137, 191
  {r: 137, g: 245, b: 245}, // 180
  {r: 137, g: 191, b: 245}, // 210
  {r: 137, g: 137, b: 245}, // 240
  {r: 191, g: 137, b: 245}, // 270
  {r: 245, g: 137, b: 245}, // 300
  {r: 245, g: 137, b: 191}, // 330
  {r: 245, g: 137, b: 137}, // 0
  {r: 245, g: 191, b: 137}, // 30
  {r: 245, g: 245, b: 137}, // 60
  {r: 191, g: 245, b: 137}, // 90
  {r: 137, g: 245, b: 137}, // 120
  {r: 137, g: 245, b: 191}, // 150

  // 80/80 - 245, 163, 204
  {r: 163, g: 245, b: 245}, // 180
  {r: 163, g: 204, b: 245}, // 210
  {r: 163, g: 163, b: 245}, // 240
  {r: 204, g: 163, b: 245}, // 270
  {r: 245, g: 163, b: 245}, // 300
  {r: 245, g: 163, b: 204}, // 330
  {r: 245, g: 163, b: 163}, // 0
  {r: 245, g: 204, b: 163}, // 30
  {r: 245, g: 245, b: 163}, // 60
  {r: 204, g: 245, b: 163}, // 90
  {r: 163, g: 245, b: 163}, // 120
  {r: 137, g: 245, b: 191}, // 150
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16)
  };
}

export function incrementRgbColour(rgb: Rgb) {
  for (const [key, value] of Object.entries(rgb)) {
    if (value > 255) {
      rgb[key] = 255;
    } else {
      rgb[key] = value + 75;
    }
  }
  return rgb;
}

function rgbToString(rgb: Rgb, opacity: number) {
  return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity.toString() + ")";
}

export function getColourFromCssVar(cssVar: string, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1;
  }
  return hexToRgb(
    getCssVarValue(cssVar)
  );
}

export function getChartColour(index: number, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1;
  }
  const rgb = colours[index];
  return rgbToString(rgb, opacity);
}

function updateOpacity(color: string, alpha: string) {
  return color.replace(/[\d.]+\)$/g, alpha + ')');
}

export function updateOpacitys(colors: string[], alpha: string) {
  return colors.map((color) => {
    return updateOpacity(color, alpha);
  });
}

export function resetItemClickedData(setItemData?: React.Dispatch<any>) {
  if (isPropDefined(setItemData)) {
    setItemData!({});
  }
}

export function setClickedColourToSolid(chart: any, chartElement: any) {
  const { datasetIndex, index } = chartElement[0];
  const originalColour = chart.data.datasets[datasetIndex].backgroundColor[index];
  chart.data.datasets[datasetIndex].backgroundColor[index] = updateOpacity(originalColour, "1");
  chart.data.datasets[datasetIndex].hoverBackgroundColor[index] = updateOpacity(originalColour, "1");
}

export function updateChartColours(chart: any, resetColours: boolean, fadedOpacity: number) {
  for (const dataset of chart.data.datasets) {
    if (resetColours) {
      dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1');
      dataset.hoverBackgroundColor = updateOpacitys(dataset.backgroundColor, fadedOpacity.toString());
    } else {
      dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, fadedOpacity.toString());
      dataset.hoverBackgroundColor = updateOpacitys(dataset.backgroundColor, '1');
    }
  }
}

export function isChartDataEmpty(aggs: any) {
  const data = Object.values(aggs)[0]!["buckets"];
  if (data.length === 0) return "No data found";
  return '';
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

export type DateInterval = "d"|"w"|"M"|"y"

export function initialiseDatasets(datasets: any[]) {
  for (let index = 0; index < datasets.length; index++) {
    const bgColour = getChartColour(index);
    const fadedColour = getChartColour(index, 0.75);
    datasets[index]["backgroundColor"] = [];
    datasets[index]["hoverBackgroundColor"] = [];
    datasets[index]["order"] = index;
    datasets[index]["colourIndex"] = index;
    const dataLength = datasets[index].data.length;
    for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
      datasets[index]["backgroundColor"].push(bgColour);
      datasets[index]["hoverBackgroundColor"].push(fadedColour);
    }
  }
  return datasets;
}

function getSortedAggData(buckets: object) {
  const keys = new Set();
  const aggs = {};
  for (const bucket of Object.values(buckets)) {
    aggs[bucket["key"]] = {};
    const data: object[] = bucket["1"]["buckets"];
    for (const datapoint of data) {
      keys.add(datapoint["key"]);
      aggs[bucket["key"]][datapoint["key"]] = datapoint["doc_count"];
    }
  }
  return {
    keys: Array.from(keys).sort((a: any, b: any) => {
      return a-b;
    }),
    aggs: aggs
  } as AggData;
}

function formatLabels(labels: string[], interval: DateInterval, shortDate?: boolean) {
  const formattedLabels: string[] = [];
  let dateFormat: string;
  if (!shortDate){
    switch(interval) {
    case "d":
    case "w":
      dateFormat = "dd LLLL yyyy";
      break;
    case "M":
      dateFormat = "LLLL yyyy";
      break;
    case "y":
      dateFormat = "yyyy";
      break;
    }
  } else {
    switch(interval) {
    case "d":
    case "w":
      dateFormat = "dd MMM yy";
      break;
    case "M":
      dateFormat = "MMM yy";
      break;
    case "y":
      dateFormat = "yy";
      break;
    }
  }
  for (const label of labels) {
    const date = new Date(label);
    formattedLabels.push(
      format(date, dateFormat)
    );
  }
  return formattedLabels;
}

// would need adapting for multiple aggs in 1 api call
export function aggsToBarChartData(aggs: object, interval: DateInterval, shortDate?: boolean): ChartData {
  const datasets: object[] = [];
  const buckets: object = aggs["agg"]["buckets"];
  const sortedAggs: AggData = getSortedAggData(buckets);
  const labels = sortedAggs.keys;

  for (const [bucket, agg] of Object.entries(sortedAggs.aggs)) {
    const data: number[] = [];

    // create datapoint list - must be in the order of the labels
    for (const key of sortedAggs.keys) {
      if (key in agg) {
        data.push(agg[key]);
      } else {
        data.push(0);
      }
    }
    const dataset = {
      id: bucket,
      label: bucket,
      data: data
    };
    datasets.push(dataset);
  }

  return {
    datasets: datasets,
    labels: formatLabels(labels, interval, shortDate)
  } as ChartData;
}

function formatDateRangeWithInterval(date: string, interval: string) {
  const from = new Date(date);
  const to = new Date(date);
  switch(interval) {
  case "d":
    to.setDate(to.getDate() + 1);
    break;
  case "w":
    to.setDate(to.getDate() + 7);
    break;
  case "M":
    to.setMonth(to.getMonth() + 1);
    break;
  case "y":
    to.setFullYear(to.getFullYear() + 1);
    break;
  }
  if (from.toString() === 'Invalid Date') {
    return false;
  }
  return {from: from, to: to};
}

export function setBarClickedData(chart: any, chartElement: any, setBarData?: React.Dispatch<any>) {
  const { datasetIndex, index } = chartElement[0];

  // setting the 'bar' value
  const bucket = chart.data.datasets[datasetIndex].id;
  const value = chart.data.datasets[datasetIndex].data[index];
  const clickKey = chart.data.labels[index];

  if (isPropDefined(setBarData)) {
    setBarData!({
      "bucket": bucket,
      "value": value,
      "clickKey": clickKey
    });
  }
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
      };
    }
  );
}

// ------------------//
//   DATE BARCHART   //
// ------------------//

export function generateDateAgg(breakDownBy: string, xAxis: string, interval: DateInterval) {
  return {
    "aggs": {
      "agg": {
        "terms": {
          "field": breakDownBy + ".keyword",
          "order": {
            "_count": "desc"
          },
          "size": 25
        },
        "aggs": {
          "1": {
            "date_histogram": {
              "field": xAxis,
              "calendar_interval": "1" + interval,
              "time_zone": "Europe/London"
            }
          }
        }
      }
    }
  };
}

export function generateDateFilterFromBarData(
  barData: object,
  breakDownBy: string,
  xAxis: string,
  interval: DateInterval
) {
  // initialise filter generated from bar clicks
  const localFilters = {
    "exact": {},
    "range": {}
  };
  
  if (barData["bucket"] !== undefined) {
    localFilters["exact"][breakDownBy] = barData["bucket"];
  }

  // providing a date the range filtering recognizes for month
  let barXKey = barData["clickKey"];
  if (interval === "M") {
    barXKey = "01 " + barXKey;
  }

  // formatting the date range for filtering
  const dateRange = formatDateRangeWithInterval(barXKey, interval);
  if (dateRange) {
    localFilters["range"][xAxis] = dateRange;
  }
  return localFilters;
}

// ------------------//
//      SUNBURST     //
// ------------------//

interface SunburstData {
  key: string,
  value: number,
  child?: SunburstData
}

interface DoughnutDataCJS {
  id: string,
  data: number[],
  total: number,
  percentages: string[]
  label: string,
  labels: string[],
  backgroundColor: string[],
  hoverBackgroundColor: string[],
  borderColor: string,
  borderWidth: number,
  borderAlign: string,
  hoverOffset: number
}

export function convertSunburstDatasets(
  datasets: object,
  outputData?: DoughnutDataCJS[],
  colourIndex?: number,
  depth?: number
) {
  // return empty if no data
  if (Object.keys(datasets).length === 0) {
    return [{}];
  }

  // set defaults if undefined
  if (outputData === undefined) outputData = [];
  if (colourIndex === undefined) colourIndex = 0;
  if (depth === undefined) {
    depth = 0;
  } else {
    depth++;
  }
  // key of what the doughnut is sliced by
  const key = Object.keys(datasets)[0];
  // the data of the slices
  const buckets: SunburstData[] = datasets[key];
  // only append the origin dict on the first iteration
  initialiseOriginDataset(outputData, key, colourIndex, depth);

  // create output data with colours etc
  for (const bucket of buckets) {
    const colour = getChartColour(colourIndex);
    const hoverColour = getChartColour(colourIndex, 0.75);
    outputData![depth].data.push(bucket.value);
    outputData![depth].total += bucket.value;
    outputData![depth].backgroundColor.push(colour);
    outputData![depth].hoverBackgroundColor.push(hoverColour);
    outputData![depth].labels.push(bucket.key);
    if (bucket.child) {
      outputData = convertSunburstDatasets(bucket.child, outputData, colourIndex, depth);
    }
    // keep colour the same for children
    if (depth === 0) {
      colourIndex++;
    }
  }
  // reverse final output (chartJS requires inner doughnut to be end of list)
  if (depth === 0) return addPercentages(outputData!.reverse());
  return outputData;
}

function initialiseOriginDataset(
  outputData: DoughnutDataCJS[],
  key: string,
  colourIndex: number,
  depth: number
) {
  if (colourIndex === 0 && outputData.length === depth) {
    outputData.push({
      id: key,
      data: [],
      total: 0,
      percentages: [],
      label: key,
      labels: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
      borderColor: getCssVarValue("--bs-body-bg"),
      borderWidth: 1,
      borderAlign: 'centre',
      hoverOffset: 0
    });
  }
}

function addPercentages(outputData: DoughnutDataCJS[]) {
  for (const entry of outputData) {
    for (const dataPoint of entry.data) {
      const percentage = (dataPoint/entry.total)*100;
      entry.percentages.push(percentage.toFixed(2)); // 2dp
    }
  }
  return outputData;
}

export function generateSunburstLabels(chart: any, titleColour: any) {
  // parent is end of list due to chartJS oddities
  const parentIndex = chart.data.datasets.length-1;
  return chart.data.datasets[parentIndex].labels.map(
    (label: any, index: any) => {
      return {
        text: label,
        fillStyle: getChartColour(index),
        fontColor: titleColour,
        pointStyle: 'rectRounded',
        lineWidth: 0
      };
    }
  );
}

function getMaxDataSizeByDepth(depth: number) {
  switch(depth) {
  case 0: // most inner ring (parent)
    return 25;
  case 1: // 2nd ring
    return 10;
  default: // 3rd ring onwards
    return 5;
  }
}

function initialiseOrIncrementDepth(depth: number|undefined) {
  if (depth === undefined) {
    return 0;
  }
  return depth + 1;
}

export function createAggsViaSliceBy(endpoint: string, sliceBy: string[], depth?: number) {
  depth = initialiseOrIncrementDepth(depth);

  const terms = {};
  terms[sliceBy[depth]] = {
    "terms": {
      "field": `${sliceBy[depth]}.keyword`,
      "order": {
        "_count": "desc"
      },
      "size": getMaxDataSizeByDepth(depth)
    }
  };

  if (depth < sliceBy.length-1) {
    terms[sliceBy[depth]]["aggs"] = createAggsViaSliceBy(endpoint, sliceBy, depth);
  }

  // create agg via parent
  if (depth === 0) {
    return {"aggs": terms};
  } else {
    return terms;
  }
}

function calcBucketDocCountTotal(buckets: any[]) {
  let count = 0;
  for (const bucket of Object.values(buckets)) {
    count += bucket.doc_count;
  }
  return count;
}

// works by changing the reference of 'buckets'
function addExtraDocCount(type: string, buckets: object[], sliceBy: string[], depth: number, count: number, parentCount?: number) {
  // ignore when it tries to work on the new 'other' bucket
  if (count !== undefined) {
    // ensure 'other' depth matches the actual values depth
    if (depth < sliceBy.length) {

      if (type === 'Unknown') {
        if (parentCount! > count) {
          buckets.push({
            doc_count: parentCount! - count, // example
            key: type
          });
        } else {
          // if data is correct, return
          return;
        }
      } else if (type === 'Other') {
        buckets.push({
          doc_count: count,
          key: type
        });
      }

      // if child required
      if (depth < sliceBy.length-1) {
        const childKey = sliceBy[depth+1];
        const lastIndex = buckets.length-1;
        // get last added object 
        buckets[lastIndex][childKey] = {
          "buckets": []
        };
        // recursively add 'other' or 'unknown'
        addExtraDocCount(
          type,
          buckets[lastIndex][childKey]["buckets"],
          sliceBy,
          depth+1,
          count,
          parentCount
        );
      }
    }
  }
}

export function aggsToSunburstData(aggsRes: any, sliceBy: string[], depth?: number, parentDocCount?: number) {
  depth = initialiseOrIncrementDepth(depth);

  // sliceBy keys
  const key = sliceBy[depth];
  const childKey = sliceBy[depth+1];
  const normalisedKey = normaliseCaps(key);

  // elastic bucket data
  const agg: SunburstData[] = aggsRes[key];
  const buckets = agg["buckets"];

  // temp 'other' fix
  const otherCount = agg["sum_other_doc_count"];
  // other doesn't exist if bucket isn't a value
  if (otherCount !== 0 && otherCount !== undefined) {
    addExtraDocCount(
      'Other',
      buckets,
      sliceBy,
      depth,
      otherCount
    );
  }

  // adding an 'unknown' bucket where parent > sum of children
  if (parentDocCount !== 0 && parentDocCount !== undefined) {
    const bucketsDocCount = calcBucketDocCountTotal(buckets);
    addExtraDocCount(
      'Unknown',
      buckets,
      sliceBy,
      depth,
      bucketsDocCount,
      parentDocCount
    );
  }

  // initialising variables required
  const outputData = {};
  outputData[normalisedKey] = [];

  for (const bucket of buckets) {
    const dataPoint = {
      key: bucket.key,
      value: bucket.doc_count
    };

    // this means the bucket has a child
    if (childKey) {
      const child = {};
      child[childKey] = bucket[childKey];
      dataPoint["child"] = aggsToSunburstData(child, sliceBy, depth, bucket.doc_count);
    }
    outputData[normalisedKey].push(dataPoint);
  }
  return outputData;
}

export function setSliceClickedData(chart: any, chartElement: any, setSliceData?: React.Dispatch<any>) {
  const { datasetIndex, index } = chartElement[0];

  // setting the 'bar' value
  const bucket = chart.data.datasets[datasetIndex].label;
  const value = chart.data.datasets[datasetIndex].data[index];
  const clickKey = chart.data.datasets[datasetIndex].labels[index];

  if (isPropDefined(setSliceData)) {
    setSliceData!({
      "bucket": bucket,
      "value": value,
      "clickKey": clickKey
    });
  }
}
