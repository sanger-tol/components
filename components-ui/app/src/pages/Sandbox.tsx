/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

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
import { initialiseDatasets } from "../tol-ui/src/charts/Utils";


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

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

const d1 = [
  {
    id: 'species_1',
    label: 'Species 1',
    data: [100, 10, 300, 340, 500, 200, 200],
    type: 'bar'
  },
  {
    id: 'species_2',
    label: 'Species 2',
    data: [100, 200, 30, 153, 500, 600, 56],
    type: 'bar'
  },
  {
    id: 'species_3',
    label: 'Species 3',
    data: [30, 240, 222, 535, 202, 340, 10],
    type: 'line'
  }
];

function Sandbox() {
  return (
    <Chart
      id='tester'
      responsive="true"
      className="tol-bar-chart"
      datasetIdKey="id"
      // @ts-ignore
      data={{
        labels: labels,
        datasets: initialiseDatasets(d1)
      }}
    />
  );
}

export default Sandbox;
