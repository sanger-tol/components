/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import {
  RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  RemoteSunburst,
  RemoteMap,
  Widgets,
  env
} from '../tol-ui/src';


function Combo() {
  // initial state for global filters is temporary
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});
  const [combinedFilters, setCombinedFilters] = useState<object>({});
  const [sunburstFilter, setSunburstFilter] = useState<object>({});
  const [mapFilter, setMapFilter] = useState<object>({});

  const chartCombo = (
    <div>
      <RemoteMultipleSelectFilters
        endpoint="run_data"
        fields={['mlwh_platform_type', 'tester']}
        globalFilters={globalFilters}
        setGlobalFilters={setGlobalFilters}
        baseUrl={env.TOL_DATA}
      />
      <div className="mb-4" />
      <RemoteBarChart
        stacked
        title="Run Data"
        endpoint="run_data"
        filter={globalFilters}
        setCombinedFilters={setCombinedFilters}
        type="date"
        breakDownBy="mlwh_platform_type"
        xAxis="mlwh_run_complete"
        interval="M"
        height={400}
        baseUrl={env.TOL_DATA}
      />
      <div className="mb-4" />
      <RemoteTable
        id="species-combo-table-1"
        endpoint="run_data"
        filter={combinedFilters}
        height={400}
        baseUrl={env.TOL_DATA}
      />
    </div>
  );

  const sunburstCombo = (
    <div>
      <RemoteSunburst
        title="Species"
        endpoint="species"
        sliceBy={["sts_order_group", "sts_family"]}
        setCombinedFilters={setSunburstFilter}
        height={400}
        legendPosition="left"
        baseUrl={ env.TOL_DATA }
      />
      <div className="mb-4" />
      <RemoteTable
        id="species-combo-table-2"
        endpoint="species"
        defaultSort="sts_scientific_name"
        height={400}
        filter={sunburstFilter}
        fields={{
          "sts_scientific_name": {
            rename: "Scientific Name",
          },
          "sts_taxon_group": {
            rename: "Taxon Group"
          },
          "sts_family": {
            rename: "Family"
          },
          "sts_order_group": {
            rename: "Order"
          },
          "sts_prefix": {
            rename: "ToLID Prefix"
          },
        }}
        baseUrl={ env.TOL_DATA }
      />
    </div>
  );

  const mapCombo = (
    <div>
      <RemoteBarChart
        stacked
        title="Samples Recieved"
        endpoint="sample"
        breakDownBy="sts_ac_status"
        xAxis="benchling_date_sample_received_at_sanger"
        interval="M"
        setCombinedFilters={setMapFilter}
        type='date'
        height={300}
        baseUrl={ env.TOL_DATA }
      />
      <div className="mb-4" />
      <RemoteMap
        endpoint="sample"
        longitudeKey="sts_longitude"
        latitudeKey="sts_latitude"
        filter={mapFilter}
        attributeKeys="sts_public_name, sts_biosample_accession"
        height={300}
        baseUrl={ env.TOL_DATA }
      />
    </div>
  );

  const components = [
    {
      component: chartCombo,
      type: 'full'
    },
    {
      component: sunburstCombo,
      type: 'full'
    },
    {
      component: mapCombo,
      type: 'full'
    }
  ];

  return (
    <div>
      <Widgets
        components={components}
      />
    </div>
  );
}

export default Combo;
