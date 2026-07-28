/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import * as XLSX from "xlsx";
import {
  IFieldMeta,
  TsDataSource,
  TDataObjectListOrNull,
  getFieldByName,
  IFilter,
  PEditableTitle,
  IChartDataset
} from "..";


const stringifyFilter = (filter: any) => {
  if (!filter) {
    return "None";
  }
  // @ts-ignore
  return JSON.stringify(filter, (key, value) => {
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }
    return value;
  })
    .replace(/"True"/g, "True")
    .replace(/"False"/g, "False");
};

// This will need changing to use DataSourceUtils.get_datasource() once we support
// direct and via_api
export function generateSdkScript(dataspace: string, filter: IFilter, objectType: string) {
  return `from tol.core import DataSourceFilter
from tol.sources.portal import portal

ds = portal(dataspace='${dataspace || "tol_production"}')
f = DataSourceFilter(
    and_ = ${stringifyFilter(filter?.and_)}
)
objs = ds.get_list('${objectType}', object_filters=f)
  `;
}

// This will need changing to use DataSourceUtils in the CLI once we support direct and via_api
export function generateCLICommand(
  dataSourceInstanceId: string,
  filter: IFilter,
  objectType: string,
  requestedFields: string[]
) {
  return `
tol data \
--source=${dataSourceInstanceId || "tol_production"} \
--operation=list \
--type=${objectType} \
--filter='${JSON.stringify(filter) || '{"and":{}}'}' \
--fields=${requestedFields.join(",")} \
--output=tsv 
  `;
}

function updateDownloadCountProgress(
  setFetchCount: (count: any) => void,
  setPercentageComplete: (percent: any) => void,
  frozenTotalSize: number,
  item: any,
  results: any[]
) {
  setFetchCount((prev) => {
    const next = prev + 1;
    const percentage = Math.floor((next / frozenTotalSize) * 100);
    setPercentageComplete(percentage);
    results.push(item);
    return next;
  });
}

const fetchSpreadSheetDataObjects = async (
  gen: AsyncGenerator,
  setFetchCount: (count: any) => void,
  setPercentageComplete: (percent: any) => void,
  stopDownloadRef: any,
  frozenTotalSize: number
) => {
  const results: any[] = [];
  for await (const item of gen) {
    updateDownloadCountProgress(
      setFetchCount,
      setPercentageComplete,
      frozenTotalSize,
      item,
      results
    )
    if (stopDownloadRef.current) throw Error();
  }
  return results;
};

export function downloadForTable(
  dataSource: TsDataSource,
  frozenObjectType: string,
  frozenFilter: IFilter,
  frozenRequestedFields: string[],
  fieldMeta: IFieldMeta,
  title: PEditableTitle | undefined,
  stopDownloadRef: any,
  setFetchCount: (count: any) => void,
  setPercentageComplete: (percent: any) => void,
  frozenTotalSize: number,
  interval: any,
  onDownloadFail: () => void,
  onDownloadComplete: () => void
) {

  const gen = dataSource.getListByCursor({
    objectType: frozenObjectType,
    filter: frozenFilter,
    requestedFields: frozenRequestedFields,
  });

  fetchSpreadSheetDataObjects(
    gen,
    setFetchCount,
    setPercentageComplete,
    stopDownloadRef,
    frozenTotalSize
  )
    .then((results) => {
      dataObjectToSpreadsheetData(results, frozenRequestedFields, fieldMeta)
        .then((info) => {
          exportDataToSpreadsheet(info, title?.text || frozenObjectType);
        })
        .finally(() => {
          onDownloadComplete()
        });
    })
    .catch(() => {
      onDownloadFail()
    })
    .finally(() => {
      clearInterval(interval);
    });
}

export function prepareChartDataForExport(
  datasets: IChartDataset[],
  labels: string[],
  setFetchCount: (count: any) => void,
  setPercentageComplete: (percent: any) => void,
  frozenTotalSize: number,
): Array<Record<string, string>> {

  return datasets.map((dataset) => {
    const row: Record<string, string> = { Dataset: dataset.label };
    labels.forEach((label, index) => {
      row[label] = String(dataset.data[index] ?? "");
    });
    updateDownloadCountProgress(
      setFetchCount,
      setPercentageComplete,
      frozenTotalSize,
      dataset,
      []
    )
    return row;
  });
}

export async function dataObjectToSpreadsheetData(
  dataObjects: TDataObjectListOrNull,
  requestedFields: string[],
  fieldMeta: IFieldMeta
) {
  const spreadsheetData: any[] = [];
  dataObjects?.forEach((obj) => {
    const flatData = {};
    requestedFields.forEach((field) => {
      flatData[`${fieldMeta.dataWithDefaults?.[field]?.rename} (${field})`] =
        Array.isArray(getFieldByName(obj, field))
          ? getFieldByName(obj, field).toString()
          : getFieldByName(obj, field);
    });
    spreadsheetData.push(flatData);
  });
  return spreadsheetData;
}

export function exportDataToSpreadsheet(
  spreadsheetData: Array<Record<string, string>>,
  title: string
) {
  const heading = `${title.replace(/\s+/g, "_")}.xlsx`;
  const worksheet = XLSX.utils.json_to_sheet(spreadsheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ToLTable");
  XLSX.writeFile(workbook, heading, { compression: true });
}

export function downloadForChart(
  datasets: IChartDataset[],
  labels: string[],
  title: PEditableTitle | undefined,
  setFetchCount: (count: any) => void,
  setPercentageComplete: (percent: any) => void,
  frozenTotalSize: number,
  frozenObjectType: string,
  interval: any,
  onDownloadFail: () => void,
  onDownloadComplete: () => void
) {
  try {
    const convertedData = prepareChartDataForExport(
      datasets,
      labels,
      setFetchCount,
      setPercentageComplete,
      frozenTotalSize
    )
    exportDataToSpreadsheet(convertedData, title?.text || frozenObjectType);
    onDownloadComplete()
  } catch {
    onDownloadFail()
  } finally {
    clearInterval(interval);
  }
}