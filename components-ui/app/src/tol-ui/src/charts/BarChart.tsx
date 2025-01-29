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
  Legend,
  LineController,
  BarController,
  PointElement,
  LineElement
} from "chart.js";
import { Chart } from "react-chartjs-2";
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
  downloadItem,
  getDefaultMaxHeight,
  getDatasetMaxHeight,
  LINE_POINT_RADIUS
} from "./Utils";
import { isPropDefined, getCssVarValue } from "../general/Utils";
import { themeListener } from "../hooks/listeners";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
  PointElement,
  LineElement
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
  cumulative?: boolean;
}

function BarChart(props: Props) {
  const { id, title, labels, setBarData, cumulative } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const stacked = isPropDefined(props.stacked);
  const originDatasets = initialiseDatasets(props.datasets);
  const [datasets, setDatasets] = useState(originDatasets);
  const [highlightedLegend, setHighlightedLegend] = useState(undefined);
  
  const [prevOrder, setPrevOrder] = useState(null);
  const [prevLegendItemIndex, setPrevLegendItemIndex] = useState(null);
  // Used to change the height of the y-axis when selecting a legend
  const defaultMaxHeight = getDefaultMaxHeight(datasets, stacked);
  const [maxHeight, setMaxHeight] = useState<number | null>(defaultMaxHeight);

  // colours
  const [titleColour, setTitleColour] = useState('');
  const [labelColour, setLabelColour] = useState('');
  const [gridColour, setGridColour] = useState('');
  themeListener(() => {
    setTitleColour(getCssVarValue("--tol-emphasis"));
    setLabelColour(getCssVarValue("--tol-text"));
    setGridColour(getCssVarValue("--tol-grey"));
  });

  //making sure legendclick is disabled when cumulative toggle is on
  const isInteractive = !cumulative && isPropDefined(setBarData); 

  // functions for options
  const handleLegendClick = (event: any, legendItem: any, legend: any) => {
    if (isInteractive) {
      const legendIndex = event.chart.data.datasets.findIndex((obj: any) => obj.label === legendItem.text);
      let selectedBucket = null;

      // cannot keep clicking on the same legend item
      if (prevLegendItemIndex !== legendIndex) {
        setHighlightedLegend(legendIndex);
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          dataset.pointRadius = LINE_POINT_RADIUS;
          if (index === legendIndex) {

            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1');
            dataset.borderColor =  updateOpacitys(dataset.borderColor, '1');
            setPrevOrder(dataset.order);
            setPrevLegendItemIndex(index);
            dataset.order = -1;
            selectedBucket = dataset.id;
            const maxValue = Math.max(...dataset.data);
            const maxValuePercentage = Math.ceil(maxValue * 1.1);
            setMaxHeight(maxValuePercentage);
          } else {
            dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '0.25');
            dataset.borderColor = updateOpacitys(dataset.borderColor, '0.25');
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
        setMaxHeight(defaultMaxHeight);
        setHighlightedLegend(undefined);
        legend.chart.data.datasets.forEach((dataset: any, index: any) => {
          dataset.backgroundColor = updateOpacitys(dataset.backgroundColor, '1');
          dataset.borderColor = updateOpacitys(dataset.borderColor, '1');
          dataset.pointRadius = LINE_POINT_RADIUS;
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
    setMaxHeight(defaultMaxHeight);
    setHighlightedLegend(undefined);
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
        setMaxHeight(getDatasetMaxHeight(chart, chartElement));
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
    animation: false,
    maintainAspectRatio: false,
    responsive: true,
    devicePixelRatio: 2,
    plugins: {
      title: {},
      tooltip: {
        animation: false,
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
            return generateBarLabels(chart, titleColour, highlightedLegend);
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
    }
  };

  datasets.forEach((dataset: any, index: number) => {
    if (dataset.yAxisID) {
      options.scales[dataset.yAxisID] = {
        stacked,
        position: index % 2 === 0 ? 'left' : 'right',
        title: {
          display: true,
          text: dataset.label,
          font: {
            size: 14
          }
        },
        max: maxHeight,
        grid: {
          color: gridColour
        },
        ticks: { // y labels
          color: labelColour
        }
      };
    }
  });

  const downloadName = props.downloadName !== undefined ? props.downloadName : 'barchart';

  return (
    <div style={{ height: height, paddingBottom: '20px' }}>
      <Row>
        <Col xs={6}>
          <div className="header-text">{title}</div>
        </Col>
        <Col xs={6}>
          <div className="tol-chart-buttons">
            {isPropDefined(setBarData) &&
              <Button
                outline
                position="right"
                type="primary"
                onClick={() => {
                  resetItemClickedData(setBarData);
                  setMaxHeight(defaultMaxHeight);
                  setDatasets(originDatasets);
                }}
                icon="undo"
              />
            }
            <Button
              outline
              position="right"
              type="primary"
              onClick={() => {
                downloadItem(props.id, downloadName);
              }}
              icon="download"
            />
          </div>
        </Col>
      </Row>

      <Chart
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
