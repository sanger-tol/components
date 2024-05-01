/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Button, Row, Col } from '../index';
import {
  getChartColour,
  initialiseDatasets,
  updateChartColours,
  setClickedColourToSolid,
  setBarClickedData,
  generateBarLabels,
  updateOpacitys,
  resetItemClickedData,
  downloadItem
} from "./Utils";
import { isPropDefined, getCssVarValue } from "../general/Utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faDownload } from '@fortawesome/free-solid-svg-icons';
import { themeListener } from "../hooks/listeners";



ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  id: string,
  stacked?: boolean,
  title: string,
  downloadName?: string,
  labels: string[],
  datasets: any[],
  height?: any,
  setBarData?: any
}

function BarChart(props: Props) {
  const { id, title, labels, setBarData } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const stacked = isPropDefined(props.stacked);
  const originDatasets = initialiseDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);
  // for keeping track of the legends click and order
  const [prevOrder, setPrevOrder] = useState(null);
  const [prevLegendItemIndex, setPrevLegendItemIndex] = useState(null);
  // Used to change the height of the y-axis when selecting a legend
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  // colours
  const [titleColour, setTitleColour] = useState('');
  const [labelColour, setLabelColour] = useState('');
  const [gridColour, setGridColour] = useState('');
  themeListener(() => {
    setTitleColour(getCssVarValue("--bs-emphasis-color"));
    setLabelColour(getCssVarValue("--bs-body-color"));
    setGridColour(getCssVarValue("--bs-secondary-bg"));
  });

  // functions for options
  function handleLegendClick(event: any, legendItem: any, legend: any) {
    if (isPropDefined(setBarData)) {
      const legendIndex = event.chart.data.datasets.findIndex((obj: any) => obj.label === legendItem.text);
      let selectedBucket = null;

      // cannot keep clicking on the same legend item
      if (prevLegendItemIndex !== legendIndex) {
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          if (index === legendIndex) {
            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1');
            setPrevOrder(dataset.order);
            setPrevLegendItemIndex(index);
            dataset.order = -1;
            selectedBucket = dataset.id;
            const maxValue = Math.max(...dataset.data);
            const maxValuePercentage = Math.ceil(maxValue * 1.1);
            setMaxHeight(maxValuePercentage);
          } else {
            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '0.25');
            // reset prev item's order
            if (prevLegendItemIndex === index) {
              dataset.order = prevOrder;
            }
          }
        });
        // sets the bar data to the selected legend
        setBarData!({
          "bucket": selectedBucket,
          "value": null,
          "clickKey": null
        });
      } else {
        setMaxHeight(null);
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1');
          setPrevOrder(null);
          setPrevLegendItemIndex(null);
          dataset.order = index;
        });
        // sets the bar data to the selected legend
        setBarData!({});
      }
      legend.chart.update();
      setDatasets(legend.chart.data.datasets);
    }
  }

  function handleLegendHover(event: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = 'pointer';
    }
  }

  // @ts-ignore
  function handlePlaneClick(event: any, chartElement: any, chart: any, item: any) {
    setMaxHeight(null);
    if (item !== undefined) {
      return;
    }

    // reset order on 'plane reset click'
    if (prevLegendItemIndex !== null) {
      chart.data.datasets[prevLegendItemIndex].order = prevOrder;
      setPrevOrder(null);
      setPrevLegendItemIndex(null);
    }

    // only clickable if setBarData is defined
    if (isPropDefined(setBarData)) {
      if (!chartElement.length) {
        // reset bar colours when clicking any other part of chart
        updateChartColours(chart, true, 0.5);
        resetItemClickedData(setBarData);
      } else {
        // fade non-clicked bars
        updateChartColours(chart, false, 0.25);
        // setting clicked bar as its original colour
        setClickedColourToSolid(chart, chartElement);
        setBarClickedData(chart, chartElement, setBarData);
      }
      chart.update();
    }
    setDatasets(chart.data.datasets);
  }

  function handlePlaneHover(event: any, chartElement: any) {
    if (isPropDefined(setBarData)) {
      event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
    }
  }

  // chart options
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {},
      tooltip: {
        usePointStyle: true,
        backgroundColor: "black",
        callbacks: {
          labelPointStyle: () => {
            return {
              pointStyle: 'rectRounded',
              rotation: 0
            };
          },
          labelColor: (context: any) => {
            const colour = getChartColour(context.datasetIndex);
            return {
              backgroundColor: colour,
              borderColor: colour
            };
          },
        }
      },
      legend: {
        onHover: handleLegendHover,
        onClick: handleLegendClick,
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart: any) => {
            return generateBarLabels(chart, titleColour);
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        bottom: 10
      }
    },
    onClick: handlePlaneClick,
    onHover: handlePlaneHover,
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: false
        },
        ticks: { // x labels
          color: labelColour
        }
      },
      y: {
        stacked: stacked,
        max: maxHeight,
        grid: {
          color: gridColour
        },
        ticks: { // y labels
          color: labelColour
        }
      },
    }
  };

  const downloadName = props.downloadName !== undefined ? props.downloadName : title;

  return (
    <div style={{ height: height, paddingBottom: '20px' }}>
      <Row>
        <Col xs={6}>
          <div className="chart-header-text">{title}</div>
        </Col>
        <Col xs={6}>
          <div className="tol-chart-buttons">
            {isPropDefined(setBarData) &&
              <Button
                className="config-button"
                variant="primary"
                onClick={() => {
                  resetItemClickedData(setBarData);
                  setMaxHeight(null);
                  setDatasets(originDatasets);
                }}
              >
                <FontAwesomeIcon icon={faUndo} size="sm" />
              </Button>
            }
            <Button
              className="config-button"
              variant="primary"
              onClick={() => {
                downloadItem(props.id, downloadName);
              }}>
              <FontAwesomeIcon icon={faDownload} size="sm" />
            </Button>
          </div>
        </Col>
      </Row>


      <Bar
        id={id}
        responsive="true"
        className="tol-bar-chart"
        datasetIdKey="id"
        // @ts-ignore
        options={options}
        data={{
          labels: labels,
          datasets: datasets
        }}
      />
    </div>
  );
}

export default BarChart;
