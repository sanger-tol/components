/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode, useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  generateSunburstLabels,
  convertSunburstDatasets,
  resetItemClickedData,
  updateChartColours,
  setClickedSectionToSolid,
  setSliceClickedData,
  setBorderColour,
  updateOpacity,
  downloadItem,
  useEffectUpdate,
  UtilityBar,
  isPropDefined,
  getCssVarValue,
  normaliseCaps,
  themeListener,
  TUtilityBarOrNull
} from "..";


ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  id: string;
  datasets: object;
  height?: any;
  legendPosition?: string;
  downloadName?: string;
  noDownload?: boolean;
  noLegend?: boolean;
  noLabel?: boolean;
  noRefresh?: boolean;
  setSliceData?: any;
  resetChart?: boolean; // a change in this prop will reset the chart
  utilityBarConfig?: TUtilityBarOrNull;
  contents?: ReactNode;
}

export function Sunburst(props: Props) {
  const {
    id,
    setSliceData,
    legendPosition,
    downloadName = "sunburst",
    noDownload,
    noLabel,
    noRefresh,
    resetChart,
    utilityBarConfig,
    contents,
    height = "100%",
  } = props;
  const originDatasets = convertSunburstDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);

  useEffect(() => {
    setDatasets(originDatasets);
  }, [props.datasets]);

  // resets chart on any change
  useEffectUpdate(() => {
    resetItemClickedData(setSliceData);
    setDatasets(originDatasets);
  }, [resetChart]);

  // colours
  const [titleColour, setTitleColour] = useState("");
  themeListener(() => {
    setTitleColour(getCssVarValue("--tol-emphasis"));
    // border update doesn't trigger chartjs re-render
    const savedDatasets = datasets;
    setDatasets([{}]);
    setDatasets(setBorderColour(savedDatasets, getCssVarValue("--tol-bg")));
  });

  // @ts-ignore
  function handlePlaneClick(
    // @ts-ignore
    event: any,
    chartElement: any,
    chart: any,
    item: any,
  ) {
    if (item !== undefined) {
      return;
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setSliceData)) {
      if (chartElement.length) {
        const { datasetIndex, index } = chartElement[0];
        const clickKey = chart.data.datasets[datasetIndex].labels[index];
        if (clickKey !== "More" && clickKey !== "Unknown") {
          // fade non-clicked bars
          updateChartColours(chart, false, 0.25);
          // setting clicked bar as its original colour
          setClickedSectionToSolid(chart, chartElement);
          setSliceClickedData(chart, chartElement, setSliceData);
        }
      }
      chart.update();
    }
    // workaround for when 'datasets' reset
    setDatasets(chart.data.datasets);
  }

  function handlePlaneHover(event: any, chartElement: any) {
    if (isPropDefined(setSliceData)) {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
      if (chartElement[0]) {
        const { datasetIndex, index } = chartElement[0];
        const clickKey = event.chart.data.datasets[datasetIndex].labels[index];
        event.native.target.style.cursor =
          clickKey !== "More" && clickKey !== "Unknown" ? "pointer" : "default";
      }
    }
  }

  // sunburst options
  const options = {
    animation: false,
    maintainAspectRatio: false,
    responsive: true,
    cutout: "12%",
    devicePixelRatio: 2,
    plugins: {
      // tooltip styling
      tooltip: {
        animation: false,
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          title: (context: any) => {
            const dataPointIndex = context[0].dataIndex;
            const percentages = context[0].dataset.percentages;
            const labels = context[0].dataset.labels;
            const datasetId = context[0].dataset.id;

            if (datasetId === "bold_bin_uri") {
              return `bin_uri: ${labels[dataPointIndex]}`;
            }

            const value = context[0].formattedValue;
            const uniqueCounts = context[0].dataset.uniqueCounts ?? [];
            const uniqueCount = uniqueCounts[dataPointIndex];
            const uniqueLabel =
              uniqueCount !== undefined && uniqueCount > 0
                ? ` ${uniqueCount} unique`
                : "";
            return `${labels[dataPointIndex]}: ${value} (${percentages[dataPointIndex]}%)${uniqueLabel}`;
          },
          label: (context: any) => {
            if (context.dataset.id === "bold_bin_uri") {
              const ringPct = context.dataset.percentages[context.dataIndex];
              const chartDatasets = context.chart.data.datasets;
              const rootTotal =
                chartDatasets[chartDatasets.length - 1]?.total ??
                context.dataset.total;
              const overallPct = ((context.raw / rootTotal) * 100).toFixed(0);
              return `Record Count: ${context.formattedValue} (${ringPct}% | ${overallPct}%)`;
            }
            if (noLabel) return null;
            const label = context.dataset.label;
            return " " + normaliseCaps(label);
          },
          labelPointStyle: () => {
            return {
              pointStyle: "rectRounded",
              rotation: 0,
            };
          },
          labelColor: (context: any) => {
            const index = context.dataIndex;
            const colour = updateOpacity(
              context.dataset.backgroundColor[index],
              "1",
            );
            return {
              backgroundColor: colour,
              borderColor: colour,
            };
          },
        },
      },
      legend: {
        display: props.noLegend ? false : true,
        position: legendPosition === undefined ? "right" : legendPosition,
        onClick: null,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateSunburstLabels(chart, titleColour);
          },
        },
      },
    },
    onClick: handlePlaneClick,
    onHover: handlePlaneHover,
  };

  return (
    <div style={{ height: height }}>
      {utilityBarConfig !== null &&
        <UtilityBar
          id={id}
          title={utilityBarConfig?.title}
          buttons={[
            {
              icon: "undo",
              position: "right",
              type: "primary",
              onClick: () => {
                resetItemClickedData(setSliceData);
                setDatasets(originDatasets);
              },
              disabled: noRefresh,
            },
            {
              icon: "download",
              position: "right",
              type: "primary",
              onClick: () => {
                downloadItem(props.id, downloadName);
              },
              disabled: noDownload,
            }
          ]}
        />
      }
      <div className={utilityBarConfig !== null ? "tol-component-contents with-offset" : "tol-component-contents"}>
        {contents ? contents : 
          <Doughnut
            id={id}
            responsive="true"
            className="tol-sunburst"
            datasetIdKey="id"
            // @ts-ignore
            options={options}
            data={{ datasets: datasets }}
          />
        }
      </div>
    </div>
  );
}
