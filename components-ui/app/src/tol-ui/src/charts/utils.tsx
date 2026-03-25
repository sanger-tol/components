/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { format } from "date-fns";
import { appendKeywordIfNeeded, getCssVarValue, IChartDataset, IFilter, isPropDefined, ISunburstBucketData, mergeAndFilters, TFilterOrUndefined, TSunburstBucketDataOrUndefined } from "..";

// ------------------//
//      GENERAL      //
// ------------------//

interface Rgb {
  [key: string]: number;
  r: number;
  g: number;
  b: number;
}

export const LINE_POINT_RADIUS = 3;
const LINE_HOVER_POINT_RADIUS = 6;

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
  { r: 3, g: 155, b: 229 }, // 210 >> {r: 110, g: 179, b: 247}
  // {r: 110, g: 110, b: 247}, // 240
  { r: 179, g: 110, b: 247 }, // 270
  // {r: 247, g: 110, b: 247}, // 300
  { r: 247, g: 110, b: 179 }, // 330
  // {r: 247, g: 110, b: 110}, // 0
  { r: 247, g: 179, b: 110 }, // 30
  // {r: 247, g: 247, b: 110}, // 60
  { r: 179, g: 247, b: 110 }, // 90
  // {r: 110, g: 247, b: 110}, // 120
  { r: 110, g: 247, b: 179 }, // 150

  // 85/75 - 245, 137, 191
  { r: 137, g: 245, b: 245 }, // 180
  { r: 137, g: 191, b: 245 }, // 210
  { r: 137, g: 137, b: 245 }, // 240
  { r: 191, g: 137, b: 245 }, // 270
  { r: 245, g: 137, b: 245 }, // 300
  { r: 245, g: 137, b: 191 }, // 330
  { r: 245, g: 137, b: 137 }, // 0
  { r: 245, g: 191, b: 137 }, // 30
  { r: 245, g: 245, b: 137 }, // 60
  { r: 191, g: 245, b: 137 }, // 90
  { r: 137, g: 245, b: 137 }, // 120
  { r: 137, g: 245, b: 191 }, // 150

  // 80/80 - 245, 163, 204
  { r: 163, g: 245, b: 245 }, // 180
  { r: 163, g: 204, b: 245 }, // 210
  { r: 163, g: 163, b: 245 }, // 240
  { r: 204, g: 163, b: 245 }, // 270
  { r: 245, g: 163, b: 245 }, // 300
  { r: 245, g: 163, b: 204 }, // 330
  { r: 245, g: 163, b: 163 }, // 0
  { r: 245, g: 204, b: 163 }, // 30
  { r: 245, g: 245, b: 163 }, // 60
  { r: 204, g: 245, b: 163 }, // 90
  { r: 163, g: 245, b: 163 }, // 120
  { r: 137, g: 245, b: 191 }, // 150
  { r: 245, g: 245, b: 245 }, // 30
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16),
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
  return (
    "rgba(" +
    rgb.r +
    ", " +
    rgb.g +
    ", " +
    rgb.b +
    ", " +
    opacity.toString() +
    ")"
  );
}

export function getColourFromCssVar(cssVar: string, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1;
  }
  return hexToRgb(getCssVarValue(cssVar));
}

export function getChartColour(index: number, opacity?: number) {
  if (opacity === undefined) {
    opacity = 1;
  }
  const rgb = colours[index];
  if (rgb === undefined) return "rgba(0, 0, 0, 1)";
  return rgbToString(rgb, opacity);
}

export function updateOpacity(color: string, alpha: string) {
  return color.replace(/[\d.]+\)$/g, alpha + ")");
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
  const originalColour =
    chart.data.datasets[datasetIndex].backgroundColor[index];
  chart.data.datasets[datasetIndex].backgroundColor[index] = updateOpacity(
    originalColour,
    "1",
  );
  chart.data.datasets[datasetIndex].hoverBackgroundColor[index] = updateOpacity(
    originalColour,
    "0.75",
  );
}

export function setClickedSectionToSolid(chart: any, chartElement: any) {
  const { datasetIndex, index } = chartElement[0];
  // fill the clicked section
  const originalColour =
    chart.data.datasets[datasetIndex].backgroundColor[index];
  chart.data.datasets[datasetIndex].backgroundColor[index] = updateOpacity(
    originalColour,
    "1",
  );
  chart.data.datasets[datasetIndex].hoverBackgroundColor[index] = updateOpacity(
    originalColour,
    "0.75",
  );

  // only if section has childen
  if (datasetIndex !== 0) {
    let solidStart = 0;
    let solidEnd = 0;
    for (let depth = datasetIndex; depth > -1; depth--) {
      // find at what start and end values the bars should be solid (first iteration)
      let currentAddedTotal = 0;
      // first iteration: find the start and end of the solid section using the data
      if (depth === datasetIndex) {
        for (let i = 0; i <= index; i++) {
          // start doesn't need adding on first iteration
          if (i !== 0) solidStart = solidEnd;
          solidEnd += chart.data.datasets[datasetIndex].data[i];
        }
        // other iterations: make the childen colours solid
      } else {
        for (let i = 0; currentAddedTotal < solidEnd; i++) {
          if (currentAddedTotal >= solidStart && currentAddedTotal < solidEnd) {
            chart.data.datasets[depth].backgroundColor[i] = updateOpacity(
              originalColour,
              "1",
            );
            chart.data.datasets[depth].hoverBackgroundColor[i] = updateOpacity(
              originalColour,
              "0.75",
            );
          }
          currentAddedTotal += chart.data.datasets[depth].data[i];
        }
      }
    }
  }
}

export function updateChartColours(
  chart: any,
  resetColours: boolean,
  fadedOpacity: number,
) {
  for (const dataset of chart.data.datasets) {
    if (resetColours) {
      dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, "1");
      dataset.hoverBackgroundColor = updateOpacitys(
        dataset.backgroundColor,
        fadedOpacity.toString(),
      );
      dataset.borderColor = updateOpacitys(
        dataset.backgroundColor,
        "1",
      );
    } else {
      dataset.backgroundColor = updateOpacitys(
        dataset.backgroundColor,
        fadedOpacity.toString(),
      );
      dataset.hoverBackgroundColor = updateOpacitys(
        dataset.backgroundColor,
        "0.75",
      );
      dataset.borderColor = updateOpacitys(
        dataset.backgroundColor,
        "0.1",
      );
    }
  }
}

export function setBorderColour(datasets: any, borderColour: string) {
  for (const data of datasets) {
    data["borderColor"] = borderColour;
  }
  return datasets;
}

export function isChartDataEmpty(aggs: any) {
  const data = Object.values(aggs)[0]!["buckets"];
  if (data.length === 0) return "No data found";
  return "";
}

// ------------------//
//      BARCHART     //
// ------------------//

interface ChartData {
  datasets: object[];
  labels: string[];
}

interface AggData {
  keys: any[];
  aggs: object[];
}

export type HistogramGrouping = "d" | "w" | "M" | "y" | "categorical";

export function initialiseDatasets(datasets: any[]) {
  for (let index = 0; index < datasets.length; index++) {
    const bgColour = getChartColour(index);
    const fadedColour = getChartColour(index, 0.75);
    datasets[index]["borderColor"] = [];
    datasets[index]["backgroundColor"] = [];
    datasets[index]["pointRadius"] = [];
    datasets[index]["pointHoverRadius"] = [];
    datasets[index]["hoverBackgroundColor"] = [];
    datasets[index]["order"] = index;
    datasets[index]["colourIndex"] = index;
    const dataLength = datasets[index].data.length;
    for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
      datasets[index]["borderColor"].push(bgColour);
      datasets[index]["backgroundColor"].push(bgColour);
      datasets[index]["hoverBackgroundColor"].push(fadedColour);
      datasets[index]["pointRadius"].push(LINE_POINT_RADIUS);
      datasets[index]["pointHoverRadius"].push(LINE_HOVER_POINT_RADIUS);
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
      return a - b;
    }),
    aggs: aggs,
  } as AggData;
}

function isDateString(label: string): boolean {
  const date = new Date(label);
  return !isNaN(date.getTime()); // Checks if date is valid
}

function formatLabels(
  labels: string[],
  grouping: HistogramGrouping,
  shortDate?: boolean,
) {
  if (grouping === "categorical") return labels;

  const formattedLabels: string[] = [];
  let dateFormat: string;

  // Define date format based on interval and shortDate
  if (!shortDate) {
    switch (grouping) {
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
      default:
        dateFormat = "";
    }
  } else {
    switch (grouping) {
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
      default:
        dateFormat = "";
    }
  }

  const labelIsDate = isDateString(labels[0]);

  if (labelIsDate) {
    for (const label of labels) {
      const date = new Date(label);
      formattedLabels.push(format(date, dateFormat));
    }
  } else {
    for (const label of labels) {
      formattedLabels.push(label); // Push as raw label
    }
  }
  return formattedLabels;
}

// would need adapting for multiple aggs in 1 api call
export function aggsToBarChartData(
  aggs: object,
  grouping: HistogramGrouping,
  shortDate?: boolean,
  cumulative?: boolean,
): ChartData {
  const datasets: object[] = [];
  const buckets: object = aggs["agg"]["buckets"];
  const sortedAggs: AggData = getSortedAggData(buckets);
  const labels = sortedAggs.keys;

  for (const [bucket, agg] of Object.entries(sortedAggs.aggs)) {
    const data: number[] = [];

    let prevTotal = 0;
    for (const key of sortedAggs.keys) {
      if (key in agg) {
        if (cumulative) {
          data.push(prevTotal + agg[key]);
          prevTotal += agg[key];
        } else {
          data.push(agg[key]);
        }
      } else {
        data.push(prevTotal);
      }
    }

    const dataset = {
      id: bucket,
      label: bucket,
      data: data,
    };
    datasets.push(dataset);
  }

  return {
    datasets: datasets,
    labels: formatLabels(labels, grouping, shortDate),
  } as ChartData;
}

function formatDateRangeWithInterval(
  date: string,
  grouping: HistogramGrouping,
) {
  const from = new Date(date);
  const to = new Date(date);
  switch (grouping) {
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
  if (from.toString() === "Invalid Date") {
    return false;
  }
  to.setTime(to.getTime() - 1); // minus 1 millisecond
  return { gte: { value: from }, lt: { value: to } };
}

export function setBarClickedData(
  chart: any,
  chartElement: any,
  setBarData?: React.Dispatch<any>,
) {
  const { datasetIndex, index } = chartElement[0];

  // setting the 'bar' value
  const bucket = chart.data.datasets[datasetIndex].id;
  const value = chart.data.datasets[datasetIndex].data[index];
  const clickKey = chart.data.labels[index];

  if (isPropDefined(setBarData)) {
    setBarData!({
      bucket: bucket,
      value: value,
      clickKey: clickKey,
    });
  }
}

export function generateBarLabels(chart: any, titleColour: any) {
  return chart.data.datasets.map((dataset: any, index: any) => {
    return {
      text: dataset.label,
      fillStyle: getChartColour(index),
      fontColor: titleColour,
      pointStyle: "rectRounded",
      lineWidth: 0,
    };
  });
}

// ---------------------------------//
//   DATE & CATEGORICAL BARCHART   //
// -------------------------------//

export function generateChartAgg(
  breakDownBy: string,
  xAxis: string,
  grouping: HistogramGrouping,
) {
  const baseAgg = {
    terms: {
      field: appendKeywordIfNeeded(breakDownBy),
      size: 25,
    },
  };

  let innerAgg;

  if (grouping === "categorical") {
    innerAgg = {
      terms: {
        field: appendKeywordIfNeeded(xAxis),
        order: {
          _key: "asc",
        },
        size: 25,
      },
    };
  } else {
    innerAgg = {
      date_histogram: {
        field: xAxis,
        calendar_interval: "1" + grouping,
        time_zone: "Europe/London",
      },
    };
  }

  return {
    aggs: {
      agg: {
        ...baseAgg,
        aggs: {
          "1": innerAgg,
        },
      },
    },
  };
}

export function generateChartFilterFromBar(
  barData: object,
  breakDownBy: string,
  xAxis: string,
  type: HistogramGrouping,
) {
  const localFilters = { and_: {} };

  // Set the breakdown filter if a bucket is present
  if (barData["bucket"] !== undefined) {
    localFilters["and_"][breakDownBy] = { eq: { value: barData["bucket"] } };
  }

  // Handle categorical and date-based filtering
  if (barData["clickKey"] !== undefined) {
    if (type === "categorical") {
      setCategoricalFilter(localFilters, xAxis, barData["clickKey"]);
    } else {
      setDateRangeFilter(localFilters, xAxis, barData["clickKey"], type);
    }
  }

  return localFilters;
}

// Helper function to handle categorical filtering
function setCategoricalFilter(localFilters: any, xAxis: string, clickKey: any) {
  if (clickKey === null) {
    // For when legend is clicked, since categorical data depends on x-axis
    localFilters["and_"][xAxis] = { exists: {} };
  } else {
    // If clickKey is defined, use eq to match the specific value
    localFilters["and_"][xAxis] = { eq: { value: clickKey } };
  }
}

// Helper function to handle date range filtering
function setDateRangeFilter(
  localFilters: any,
  xAxis: string,
  clickKey: any,
  type: HistogramGrouping,
) {
  if (clickKey === null) {
    // For when legend is clicked, since categorical data depends on x-axis
    localFilters["and_"][xAxis] = { exists: {} };
  } else {
    let barXKey = clickKey;
    if (type === "M") {
      barXKey = "01 " + barXKey; // Adjust date format for month-based grouping
    }

    const dateRange = formatDateRangeWithInterval(barXKey, type);
    if (dateRange) {
      localFilters["and_"][xAxis] = dateRange;
    }
  }
}

// ------------------//
//      SUNBURST     //
// ------------------//

interface SunburstData {
  key: string;
  value: number;
  child?: SunburstData;
  /**
   * Filter object for this bucket
   */
  filter: IFilter;
}

interface DoughnutDataChartJS {
  id: string;
  data: number[];
  total: number;
  percentages: string[];
  label: string;
  labels: string[];
  backgroundColor: string[];
  hoverBackgroundColor: string[];
  borderColor: string;
  borderWidth: number;
  borderAlign: string;
  hoverOffset: number;
  /**
   * List of filters in order of the data points
   */
  filter: IFilter[];
}

// removing single rings to show as much detail as possible
function removeSingleDatasets(datasets: object) {
  // key of what the doughnut is sliced by
  const key = Object.keys(datasets)[0];
  if (datasets[key].length === 1) {
    if (datasets[key][0]["child"] !== undefined) {
      datasets = removeSingleDatasets(datasets[key][0]["child"]);
    }
  }
  return datasets;
}

export function convertSunburstDatasets(
  datasets: object,
  outputData?: DoughnutDataChartJS[],
  colourIndex?: number,
  depth?: number,
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
    datasets = removeSingleDatasets(datasets);
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
    outputData![depth].filter.push(bucket.filter);
    if (bucket.child) {
      outputData = convertSunburstDatasets(
        bucket.child,
        outputData,
        colourIndex,
        depth,
      );
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
  outputData: DoughnutDataChartJS[],
  key: string,
  colourIndex: number,
  depth: number,
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
      borderColor: getCssVarValue("--tol-bg"),
      borderWidth: 0.2,
      borderAlign: "centre",
      hoverOffset: 0,
      filter: [],
    });
  }
}

function addPercentages(outputData: DoughnutDataChartJS[]) {
  for (const entry of outputData) {
    for (const dataPoint of entry.data) {
      const percentage = (dataPoint / entry.total) * 100;
      entry.percentages.push(percentage.toFixed(2)); // 2dp
    }
  }
  return outputData;
}

export function generateSunburstLabels(chart: any, titleColour: any) {
  // return empty if it doesn't exist
  if (chart.data.datasets[0].data.length === 0) return;
  // parent is end of list due to chartJS oddities
  const parentIndex = chart.data.datasets.length - 1;
  return chart.data.datasets[parentIndex].labels.map(
    (label: any, index: any) => {
      return {
        text: label,
        fillStyle: getChartColour(index),
        fontColor: titleColour,
        pointStyle: "rectRounded",
        lineWidth: 0,
      };
    },
  );
}

function initialiseOrIncrementDepth(depth?: number) {
  if (depth === undefined) return 0;
  return depth + 1;
}

export function createAggsViaSliceBy(
  objectType: string,
  sliceBy: string[],
  depth?: number,
) {
  depth = initialiseOrIncrementDepth(depth);

  const terms = {};
  const field = sliceBy[depth];
  terms[sliceBy[depth]] = {
    terms: {
      field: appendKeywordIfNeeded(field),
      order: {
        _count: "desc",
      },
      size: 25,
    },
  };

  if (depth < sliceBy.length - 1) {
    terms[sliceBy[depth]]["aggs"] = createAggsViaSliceBy(
      objectType,
      sliceBy,
      depth,
    );
  }

  // create agg via parent
  if (depth === 0) {
    return { aggs: terms };
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
function addExtraDocCount(
  type: string,
  buckets: object[],
  sliceBy: string[],
  depth: number,
  count: number,
  parentCount?: number,
) {
  // ignore when it tries to work on the new 'more' bucket
  if (count !== undefined) {
    // ensure 'more' depth matches the actual values depth
    if (depth < sliceBy.length) {
      if (type === "Unknown") {
        if (parentCount! > count) {
          buckets.push({
            doc_count: parentCount! - count, // example
            key: type,
          });
        } else {
          // if data is correct, return
          return;
        }
      } else if (type === "More") {
        buckets.push({
          doc_count: count,
          key: type,
        });
      }

      // if child required
      if (depth < sliceBy.length - 1) {
        const childKey = sliceBy[depth + 1];
        const lastIndex = buckets.length - 1;
        // get last added object
        buckets[lastIndex][childKey] = {
          buckets: [],
        };
        // recursively add 'more' or 'unknown'
        addExtraDocCount(
          type,
          buckets[lastIndex][childKey]["buckets"],
          sliceBy,
          depth + 1,
          count,
          parentCount,
        );
      }
    }
  }
}

/**
 * Builds an `IFilter` for a clicked sunburst bucket, merged with any ancestor filters.
 *
 * - `"More"`: matches all values not already shown as named siblings (negated `in_list`).
 * - `"Unknown"`: returns an empty filter, as it represents missing/unknown values.
 * - Any other value: matches the exact bucket value via `eq`.
 *
 * @param field - The field name this bucket represents (e.g. `"genus"`).
 * @param bucket - The clicked bucket key (e.g. `"Homo"`, `"More"`, `"Unknown"`).
 * @param siblingBucketKeys - All bucket keys at the same depth, used to build the negation list for `"More"`.
 * @param ancestorFilters - Optional accumulated filter from parent bucket selections.
 * @returns A merged `IFilter` representing the full selection path including this bucket.
 */
export function generateFilterFromSunburstBucket(
  field: string,
  bucket: string,
  siblingBucketKeys: string[],
  ancestorFilters?: IFilter
): IFilter {
  const andFilter = {};

  switch (bucket) {
    case "More":
      andFilter[field] = {
        exists: {},
        in_list: {
          value: [...siblingBucketKeys.filter((key) => key !== "More" && key !== "Unknown")],
          negate: true,
        },
      };
      break;
    case "Unknown":
      return {};
    default:
      andFilter[field] = { 
        eq: { value: bucket }
      };
  }

  return {
    and_: mergeAndFilters(ancestorFilters?.and_ ?? {}, andFilter)
  };
}

/**
 * Recursively converts an Elasticsearch aggregation response into structured sunburst chart data.
 *
 * Injects synthetic `"More"` buckets for truncated results and `"Unknown"` buckets where
 * the sum of its children is less than the parent doc count. Each bucket is assigned a filter
 * representing its full selection path for use when the slice is clicked.
 *
 * @param aggsResponse - The raw aggregation response object from Elasticsearch.
 * @param sliceBy - Ordered array of field names defining the sunburst hierarchy levels.
 * @param depth - Current recursion depth; omit on the initial call.
 * @param parentDocCount - Doc count of the parent bucket, used to calculate `"Unknown"` counts.
 * @param ancestorFilters - Accumulated filter from parent bucket selections, passed down recursively.
 * @returns A nested object keyed by field name, containing the structured sunburst data for each level.
 */
export function aggsToSunburstData(
  aggsResponse: any,
  sliceBy: string[],
  depth?: number,
  parentDocCount?: number,
  ancestorFilters?: IFilter,
) {
  depth = initialiseOrIncrementDepth(depth);

  // sliceBy keys
  const key = sliceBy[depth];
  const childKey = sliceBy[depth + 1];

  // elastic bucket data
  const agg: SunburstData[] = aggsResponse[key];
  const buckets = agg["buckets"];

  // temp 'more' fix
  const moreCount = agg["sum_other_doc_count"];
  // 'more' doesn't exist if bucket isn't a value
  if (moreCount !== 0 && moreCount !== undefined) {
    addExtraDocCount("More", buckets, sliceBy, depth, moreCount);
  }

  // adding an 'unknown' bucket where parent > sum of children
  if (parentDocCount) {
    const bucketsDocCount = calcBucketDocCountTotal(buckets);
    addExtraDocCount(
      "Unknown",
      buckets,
      sliceBy,
      depth,
      bucketsDocCount,
      parentDocCount,
    );
  }

  // initialising variables required
  const outputData = {};
  outputData[key] = [];

  for (const bucket of buckets) {
    const filter = generateFilterFromSunburstBucket(
      key,
      bucket.key,
      buckets.map((b) => b.key),
      ancestorFilters
    );

    const dataPoint = {
      key: bucket.key,
      value: bucket.doc_count,
      filter: filter,
    };

    // this means the bucket has a child
    if (childKey) {
      const child = {};
      child[childKey] = bucket[childKey];
      dataPoint["child"] = aggsToSunburstData(
        child,
        sliceBy,
        depth,
        bucket.doc_count,
        filter,
      );
    }
    outputData[key].push(dataPoint);
  }
  return outputData;
}

export function setSliceClickedData(
  chart: any,
  chartElement: any,
  setSliceData?: React.Dispatch<React.SetStateAction<ISunburstBucketData>>,
) {
  const { datasetIndex, index } = chartElement[0];

  // setting the 'bar' value
  const bucket = chart.data.datasets[datasetIndex].label;
  const value = chart.data.datasets[datasetIndex].data[index];
  const clickKey = chart.data.datasets[datasetIndex].labels[index];
  const depth = chart.data.datasets.length - datasetIndex;
  const filter = chart.data.datasets[datasetIndex].filter[index];

  if (setSliceData) {
    setSliceData({
      bucket: bucket,
      value: value,
      clickKey: clickKey,
      datasetIndex: datasetIndex,
      depth: depth,
      filter: filter,
    });
  }
}

/**
 * Returns a new array with the first `depth` elements removed.
 * Does not mutate the original array.
 * 
 * @param sliceBy - The original array to slice.
 * @param depth - The number of elements to remove from the start of the array.
 * @returns A new array with single rings removed based on the depth.
 */
export function removeSliceBySingles(sliceBy: string[], depth: number) {
  return sliceBy.slice(depth);
}

export function downloadItem(chartId: string, chartTitle: string) {
  // use light/dark mode background color to determine background color of item
  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const bodyColor = getComputedStyle(document.body).backgroundColor;
  const bgColor = darkModeQuery.matches ? bodyColor : "#ffffff";

  // create link element and  get chart by id
  const canvasLink = document.createElement("a");
  const canvas = document.getElementById(chartId) as HTMLCanvasElement;

  if (canvas) {
    const width = canvas.width;
    const height = canvas.height;

    // Create temporary canvas to draw background
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Create temporary context
    const tempContext = tempCanvas.getContext("2d");

    if (tempContext) {
      tempContext.fillStyle = bgColor;
      tempContext.fillRect(0, 0, width, height);
      tempContext.drawImage(canvas, 0, 0);

      // Convert temporary canvas to base64 image
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          canvasLink.href = url;
          canvasLink.download = chartTitle + ".png";
          canvasLink.click();
          URL.revokeObjectURL(url); // Clean up
        }
      }, "image/png");
    }
  }
}

export function generateSunburstConfig(attributes: string[]) {
  return {
    sliceBy: attributes,
  }
}

// ------------------//
//        Map        //
// ------------------//

interface MarkerObject {
  geometry: {
    coordinates: number[];
  };
  properties: {
    [key: string]: any;
  };
  colour?: string;
}

export function formattingAttributeKeys(attributeKeysArray, item, marker) {
  attributeKeysArray.forEach((key) => {
    // check if the attribute key exists in item.attributes
    if (item.attributes.hasOwnProperty(key)) {
      //eslint-disable-line
      // add the attribute key and it's value to properties
      marker.properties[key] = item.attributes[key];
    }
  });
  return marker;
}

export function createMapMarkers(
  data: any,
  latitudeKey: string,
  longitudeKey: string,
  legendKey: object[],
  setLegendKey: Function,
  attributeKeys?: string,
  markerRenderer?: Function,
): MarkerObject[] {
  const markers: MarkerObject[] = [];
  const attributeKeysArray = attributeKeys
    ? attributeKeys.split(",").map((key) => key.trim())
    : [];

  if (latitudeKey.includes(".") || longitudeKey.includes(".")) {
    const relationshipName = latitudeKey.split(".")[0];
    const latAttribute = latitudeKey.split(".")[1];
    const longAttribute = longitudeKey.split(".")[1];
    data.forEach((item: any) => {
      if (item.relationships[relationshipName].data) {
        const longitude = parseFloat(
          item.relationships[relationshipName].data.attributes[longAttribute],
        );
        const latitude = parseFloat(
          item.relationships[relationshipName].data.attributes[latAttribute],
        );
        // skips item if no long or lat value is provided
        if (!isNaN(longitude) && !isNaN(latitude)) {
          let marker: MarkerObject = {
            geometry: {
              coordinates: [latitude, longitude],
            },
            properties: {},
          };

          if (attributeKeys) {
            marker = formattingAttributeKeys(attributeKeysArray, item, marker);
          }

          if (markerRenderer) {
            const returnedValue = markerRenderer(item);
            marker.colour = returnedValue.colour;
            const isInLegendKey = legendKey.some(
              (legendItem) =>
                JSON.stringify(legendItem) === JSON.stringify(returnedValue),
            );
            // Add the object to legendKey if it is not already in there
            if (!isInLegendKey) {
              legendKey.push(returnedValue);
            }
            setLegendKey(legendKey);
          }
          markers.push(marker);
        }
      }
    });
  } else {
    for (const item of data) {
      const latitude = parseFloat(item.attributes[latitudeKey]);
      const longitude = parseFloat(item.attributes[longitudeKey]);

      // if latitute or longitude are not provided, skip the current iteration
      if (isNaN(latitude) || isNaN(longitude)) {
        continue;
      }

      // create a marker with coordinate information
      let marker: MarkerObject = {
        geometry: {
          coordinates: [latitude, longitude],
        },
        properties: {},
      };

      // if attributeKeys are given, add them to properties
      if (attributeKeys) {
        marker = formattingAttributeKeys(attributeKeysArray, item, marker);
      }
      if (markerRenderer) {
        const returnedValue = markerRenderer(item);
        marker.colour = returnedValue.colour;
        const isInLegendKey = legendKey.some(
          (legendItem) =>
            JSON.stringify(legendItem) === JSON.stringify(returnedValue),
        );
        if (!isInLegendKey) {
          legendKey.push(returnedValue);
        }
        setLegendKey(legendKey);
      }
      markers.push(marker);
    }
  }
  return markers;
}

export function calculateTotalAggsSize(datasets: IChartDataset[]) {
  let total = 0;
  datasets.forEach((dataset: IChartDataset) => {
    total = total + dataset.data.length
  })
  return total
}
