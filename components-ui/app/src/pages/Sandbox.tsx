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
import { RemoteBarChart, env } from "../tol-ui/src";


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

     <div>
      <RemoteBarChart
      id="forecast-bar-chart"
      stacked
      title="Forecast lib/seq"
      breakDownBy="demand_forecast_analysis_type"
      xAxis="demand_forecast_date"
      type='categorical'
      endpoint="forecast"
      baseUrl="https://portal-staging.tol.sanger.ac.uk/api/v1"
      height={500}
    />

   <RemoteBarChart
     id="cost-bar-chart"
     stacked
     breakDownBy="finance_project_cost_id"
     title="Cost"
     xAxis="finance_period"
     yAxis={{
       field: 'finance_study_id',
       yAxisID: 'y1',
       yAxisLabel: 'Finance Amount'
     }}
     type='categorical'
     endpoint="cost"
     baseUrl="https://portal-staging.tol.sanger.ac.uk/api/v1"
     height={500}
     aggType="sum"
   />

      
  </div>
  );
}

export default Sandbox;
