/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  RemoteCount,
  RemoteMap,
  Filter,
  RemoteTable,
  RemoteSunburst,
  RemoteBarChart,
  Widgets,
  env,
  useZone
} from '../tol-ui/src';


function Filters() {
  const species = useZone({
    endpoint: 'species',
    baseUrl: env.TOL_DATA,
    components: [
      {
        id: 'filter-one',
        filter: {
          and_: {
            'sts_family': {
              exists: {},
              contains: {
                value: 'Diplonemidae'
              }
            },
            'sts_scientific_name': {
              exists: {},
              contains: {
                value: 'Rh'
              }
            },
            'benchling_extraction_benchling_completion_date_min': {
              gte: {
                value: '2021-01-01'
              },
              lt: {
                value: '2024-01-01'
              }
            },
            'goat_taxon_rank': {
              in_list: {
                value: ['species', 'genus']
              }
            }
          }
        }
      },
      {id: 'filter-two'},
      {id: 'table-1'},
      {id: 'table-2'},
      {id: 'count'}
    ]
  });

  const table = (
    <div>
      <h5>Table Example</h5>
      <p style={{marginBottom: 10}}>A default filter has been applied; the input is pre-populated.</p>
      <p style={{marginBottom: 3}}>Filter Level 1:</p>
      <Filter
        attribute='sts_family'
        rename='Family'
        type='str'
        componentId='filter-one'
        {...species}
      />
      <div style={{height: 6}}/>
      <Filter
        attribute='sts_scientific_name'
        rename='Scientific Name'
        type='str'
        componentId='filter-one'
        {...species}
      />
      <div style={{height: 6}}/>
      <Filter
        attribute='benchling_extraction_benchling_completion_date_min'
        rename='Benchling Extraction Min Date'
        type='datetime'
        componentId='filter-one'
        {...species}
      />
      <div style={{height: 6}}/>
      <Filter
        attribute='goat_taxon_rank'
        rename='Taxon Rank'
        type='multi'
        componentId='filter-one'
        {...species}
      />
      <div style={{height: 6}}/>
      <Filter
        attribute='benchling_sequencing_request_count'
        rename='Request Count'
        type='int'
        componentId='filter-one'
        {...species}
      />
      <p style={{marginTop: 10, marginBottom: 3}}>Filter Level 2:</p>
      <Filter
        attribute='sts_family'
        rename='Family Two'
        type='str'
        componentId='filter-two'
        {...species}
      />
      <p style={{marginTop: 15, marginBottom: 10}}>Filter Level 3:</p>
      <RemoteTable
        id="table-1"
        fields={{
          uid: {
            rename: "ID"
          },
          sts_family: {
            rename: 'Family'
          },
          benchling_sequencing_request_count: {
            rename: 'Request Count'
          },
          benchling_extraction_benchling_completion_date_min: {
            rename: 'Benchling Ex. Min Date'
          },
          goat_taxon_rank: {
            rename: 'Taxon Rank'
          }
        }}
        height={300}
        {...species}
      />
      <p style={{marginTop: 15, marginBottom: 10}}>Filter Level 4:</p>
      <RemoteTable
        id="table-2"
        fields={{
          uid: {
            rename: "ID"
          },
          sts_scientific_name: {
            rename: 'Name'
          }
        }}
        height={300}
        {...species}
      />
      <p style={{marginTop: 10}}>Filter Level 5:</p>
      <div style={{height: 110, marginTop: 20}}>
        <RemoteCount
          id="count"
          title="Total Species"
          {...species}
        />
      </div>
    </div>
  );

  const runDataMap = useZone({
    endpoint: 'barcoding_run_data',
    baseUrl: env.TOL_DATA,
    components: [
      {
        id: 'map-filter',
        filter: {
          and_: {
            'sts_sample.id': {
              exists: {}
            }
          }
        }
      },
      {id: 'map'}
    ]
  });

  const map = (
    <div>
      <h5 style={{marginBottom: 10}}>Map Example</h5>
      <Filter
        attribute='bioscan_o'
        rename='Order'
        type='str'
        componentId='map-filter'
        {...runDataMap}
      />
      <div style={{height: 10}}/>
      <RemoteMap
        id='map'
        bubble
        longitudeKey="sts_sample.sts_longitude.keyword"
        latitudeKey="sts_sample.sts_latitude.keyword"
        attributeKeys="bioscan_s"
        height={400}
        {...runDataMap}
      />
    </div>
  );

  const runDataSunburst = useZone({
    endpoint: 'barcoding_run_data',
    baseUrl: env.TOL_DATA,
    components: [
      {
        id: 'sunburst-filter',
        filter: {
          and_: {
            'sts_sample.id': {
              exists: {}
            },
            'bioscan_o': {
              contains: {
                value: "Lep"
              }
            }
          }
        }
      },
      {id: 'sunburst-table'}
    ]
  });

  const sunburst = (
    <div>
      <h5 style={{marginBottom: 10}}>Sunburst Example</h5>
      <Filter
        attribute='bioscan_o'
        rename='Order'
        type='str'
        componentId='sunburst-filter'
        {...runDataSunburst}
      />
      <div style={{height: 20}}/>
      <RemoteSunburst
        title="Missing example: NOT PART OF ZONE STATE"
        endpoint='barcoding_run_data'
        baseUrl={env.TOL_DATA}
        id="sunburst"
        sliceBy={[
          "bioscan_o",
          "bioscan_f",
          "bioscan_g",
          "bioscan_s"
        ]}
        height={500}
      />
      <div style={{height: 30}}/>
      <RemoteTable
        id="sunburst-table"
        defaultSort="bioscan_specimen.id"
        fields={{
          "bioscan_specimen.id": {
            rename: "Specimen ID",
            cellRenderer: null
          },
          "sts_sample.id": {
            rename: "Sample",
            width: 150,
            cellRenderer: null
          },
          "bioscan_c": {
            rename: "Class",
          },
          "bioscan_o": {
            rename: "Order"
          },
          "bioscan_f": {
            rename: "Family"
          }
        }}
        height={400}
        {...runDataSunburst}
      />
    </div>
  );


  const runDataChart = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [
      {id: 'chart'},
      {id: 'chart-table'}
    ]
  });

  const chart = (
    <div>
      <RemoteBarChart
        stacked
        id="chart"
        title="Run Data"
        type="M"
        breakDownBy="mlwh_platform_type"
        xAxis="mlwh_run_complete"
        height={400}
        {...runDataChart}
      />
      <div style={{height: 30}}/>
      <RemoteTable
        id="chart-table"
        height={400}
        {...runDataChart}
      />
    </div>
  );

  const components = [
    {
      component: <h2>Filters</h2>,
      type: 'full'
    },
    {
      component: table,
      type: 'full'
    },
    {
      component: map,
      type: 'full'
    },
    {
      component: sunburst,
      type: 'full'
    },
    {
      component: chart,
      type: 'full'
    }
  ];

  return <Widgets components={components} />;
}

export default Filters;
