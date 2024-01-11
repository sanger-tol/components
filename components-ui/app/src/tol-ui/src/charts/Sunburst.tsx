/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { generateSunburstLabels, 
  convertSunburstDatasets,
  resetItemClickedData,
  updateChartColours,
  setClickedColourToSolid,
  setSliceClickedData } from "./ChartUtils";
import { isPropDefined, getCssVarValue } from "../general/Utils";


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  title?: string,
  datasets: object,
  height: number,
  legendPosition?: string,
  noLabel?: boolean,
  setSliceData?: any
}

function Sunburst(props: Props) {
  const { title, datasets, height, setSliceData, legendPosition, noLabel } = props;

  const data = {
    datasets: convertSunburstDatasets(datasets)
  };

  // colours
  const titleColour = getCssVarValue("--bs-emphasis-color");

  // @ts-ignore
  function handlePlaneClick(event: any, chartElement: any, chart: any, item: any) {
    if (item !== undefined) {
      return;
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setSliceData)) {
      if (!chartElement.length) {
        // reset bar colours when clicking other any part of chart
        updateChartColours(chart, true, 0.5);
        resetItemClickedData(setSliceData);
      } else {
        // fade non-clicked bars
        updateChartColours(chart, false, 0.25);
        // setting clicked bar as its original colour
        setClickedColourToSolid(chart, chartElement);
        setSliceClickedData(chart, chartElement, setSliceData);
      }
      chart.update();
    }
  }

  function handlePlaneHover (event: any, chartElement: any) {
    if (isPropDefined(setSliceData)) {
      event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
    }
  }

  // sunburst options
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: "20%",
    plugins: {
      title: {
        display: title !== undefined,
        text: title,
        color: titleColour
      },
      // tooltip styling
      tooltip: {
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          title: (context: any) => {
            const dataPointIndex = context[0].dataIndex;
            const labels = context[0].dataset.labels;
            const value = context[0].formattedValue;
            const percentages = context[0].dataset.percentages;
            return `${labels[dataPointIndex]}: ${value} (${percentages[dataPointIndex]}%)`;
          },
          label: (context: any) => {
            if (noLabel){
              return null;
            }
            const label = context.dataset.label;
            return " " + label;
          },
          labelPointStyle: () => {
            return {
              pointStyle: 'rectRounded',
              rotation: 0
            };
          },
          labelColor: (context: any) => {
            const index = context.dataIndex;
            const colour = context.dataset.backgroundColor[index];
            return {
              backgroundColor: colour,
              borderColor: colour
            };
          },
        }
      },
      legend: {
        position: legendPosition,
        onClick: null,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateSunburstLabels(chart, titleColour);
          }
        }
      }
    },
    onClick: handlePlaneClick,
    onHover: handlePlaneHover
  };

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
  );
}

export default Sunburst;
