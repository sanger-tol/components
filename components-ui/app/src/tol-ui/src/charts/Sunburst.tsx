/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Button } from '../index';
import {
  generateSunburstLabels, 
  convertSunburstDatasets,
  resetItemClickedData,
  updateChartColours,
  setClickedColourToSolid,
  setSliceClickedData,
  updateOpacity
} from "./ChartUtils";
import { isPropDefined, getCssVarValue, normaliseCaps } from "../general/Utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";


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
  const {title, height, setSliceData, legendPosition, noLabel} = props;
  const originDatasets = convertSunburstDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);

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
        // reset bar colours when clicking any other part of chart
        updateChartColours(chart, true, 0.5);
        resetItemClickedData(setSliceData);
      } else {
        const { datasetIndex, index } = chartElement[0];
        const clickKey = chart.data.datasets[datasetIndex].labels[index];
        if (clickKey !== "More" && clickKey !== "Unknown") {
          // fade non-clicked bars
          updateChartColours(chart, false, 0.25);
          // setting clicked bar as its original colour
          setClickedColourToSolid(chart, chartElement);
          setSliceClickedData(chart, chartElement, setSliceData);
        }
      }
      chart.update();
    }
    // workaround for when 'datasets' reset
    setDatasets(chart.data.datasets);
  }

  function handlePlaneHover (event: any, chartElement: any) {
    if (isPropDefined(setSliceData)) {
      event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
      if (chartElement[0]) {
        const { datasetIndex, index } = chartElement[0];
        const clickKey = event.chart.data.datasets[datasetIndex].labels[index];
        event.native.target.style.cursor = (
          clickKey !== "More" && clickKey !== "Unknown"
        ) ? "pointer" : "default";
      }
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
            return " " + normaliseCaps(label);
          },
          labelPointStyle: () => {
            return {
              pointStyle: 'rectRounded',
              rotation: 0
            };
          },
          labelColor: (context: any) => {
            const index = context.dataIndex;
            const colour = updateOpacity(
              context.dataset.backgroundColor[index],
              '1'
            );
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
      <div className="tol-chart-buttons">
        {isPropDefined(setSliceData) &&
          <Button
            className="config-button"
            variant="primary"
            onClick={() => {
              resetItemClickedData(setSliceData);
              setDatasets(originDatasets);
            }}
          >
            <FontAwesomeIcon icon={faUndo} size="sm" />
          </Button>
        }
      </div>
      <Doughnut
        responsive="true"
        id="tol-sunburst"
        className="tol-sunburst"
        datasetIdKey="id"
        // @ts-ignore
        options={options}
        data={{datasets: datasets}}
      />
    </div>
  );
}

export default Sunburst;
