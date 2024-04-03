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
import { Button, Col, Row } from '../index';
import {
  generateSunburstLabels,
  convertSunburstDatasets,
  resetItemClickedData,
  updateChartColours,
  setClickedSectionToSolid,
  setSliceClickedData,
  setBorderColour,
  updateOpacity,
  downloadItem
} from "./ChartUtils";
import { isPropDefined, getCssVarValue, normaliseCaps } from "../general/Utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import { themeListener } from "../hooks/listeners";


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  id: string,
  title: string,
  datasets: object,
  height: any,
  width?: number,
  legendPosition?: string,
  downloadName?: string,
  noLegend?: boolean,
  noLabel?: boolean,
  noRefresh?: boolean,
  setSliceData?: any
}

function Sunburst(props: Props) {
  const { id, title, width, setSliceData, legendPosition, noLegend, noLabel, noRefresh } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const originDatasets = convertSunburstDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);

  // colours
  const [titleColour, setTitleColour] = useState('');
  themeListener(() => {
    setTitleColour(getCssVarValue("--bs-emphasis-color"));
    // border update doesn't trigger chartjs re-render
    const savedDatasets = datasets;
    setDatasets([{}]);
    setDatasets(
      setBorderColour(
        savedDatasets,
        getCssVarValue("--bs-body-bg")
      )
    );
  });

  // @ts-ignore
  function handlePlaneClick(event: any, chartElement: any, chart: any, item: any) {
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
            if (noLabel) {
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
        display: noLegend ? false : true,
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

  // adding component sizing
  const paddingBottom = id.includes('-mini') ? "5px" : "30px";
  const style = { height: height, paddingBottom: paddingBottom };
  if (width !== undefined) style["width"] = width.toString() + 'px';

  const downloadName = props.downloadName !== undefined ? props.downloadName : title;

  return (
    <div style={style}>
      <Row>
        <Col xs={6}>
          <p className="chart-header-text">{props.title}</p>
        </Col>
        <Col xs={6}>
          <div className="tol-chart-buttons">
            {isPropDefined(setSliceData) && noRefresh === undefined &&
              <div>
                <Button
                  className="config-button"
                  variant="primary"
                  onClick={() => {
                    resetItemClickedData(setSliceData);
                    setDatasets(originDatasets);
                  }}>
                  <FontAwesomeIcon icon={faUndo} size="sm" />
                </Button>
              </div>
            }
            {!props.id.includes('-mini') &&
              <div>
                <Button
                  className="config-button"
                  variant="primary"
                  onClick={() => {
                    downloadItem(props.id, downloadName);
                  }}>
                  <FontAwesomeIcon icon={faDownload} size="sm" />
                </Button>
              </div>
            }
          </div>
        </Col>
      </Row>
      <Doughnut
        id={id}
        responsive="true"
        className="tol-sunburst"
        datasetIdKey="id"
        // @ts-ignore
        options={options}
        data={{ datasets: datasets }}
      />
    </div>
  );
}

export default Sunburst;
