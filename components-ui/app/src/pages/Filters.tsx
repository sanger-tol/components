/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { tolDataSource } from ".";
import {
  Button,
  RemoteCount,
  RemoteMap,
  Filter,
  RemoteTable,
  RemoteSunburst,
  RemoteBarChart,
  Widgets,
  useZone,
  resetZone,
  useTranslator,
} from "../tol-ui/src";

export function Filters() {
  const speciesZone = useZone({
    objectType: "species",
    dataSource: tolDataSource,
    filter: {
      and_: {
        sts_family: {
          in_list: {
            value: ["Hylocomiaceae", "Crabronidae"],
            negate: true,
          },
        },
      },
    },
    components: [
      {
        id: "filter-one",
        filter: {
          and_: {
            sts_scientific_name: {
              contains: {
                value: "Rh",
              },
            },
            benchling_extraction_benchling_completion_date_min: {
              gte: {
                value: "2021-01-01",
              },
              lt: {
                value: "2024-01-01",
              },
            },
            goat_taxon_rank: {
              in_list: {
                value: ["species", "genus"],
              },
            },
            sts_ready: {
              in_list: {
                value: ["true"],
              },
            },
          },
        },
      },
      { id: "filter-two" },
      { id: "table-1" },
      { id: "table-2" },
      { id: "count" },
    ],
  });

  const table = (
    <div>
      <h5>Table Example</h5>
      <p style={{ marginBottom: 5 }}>
        A default filter has been applied; the input is pre-populated.
      </p>
      <div style={{ margin: "10px 0 10px 0" }}>
        <Button
          type="primary"
          onClick={() => resetZone(speciesZone)}
          text="Reset"
        />
      </div>
      <p style={{ marginBottom: 3 }}>Filter Level 1:</p>
      <Filter
        attribute="sts_family"
        rename="Family"
        type="str"
        componentId="filter-one"
        {...speciesZone}
      />
      <div style={{ height: 6 }} />
      <Filter
        attribute="sts_scientific_name"
        rename="Scientific Name"
        type="str"
        componentId="filter-one"
        {...speciesZone}
      />
      <div style={{ height: 6 }} />
      <Filter
        attribute="benchling_extraction_benchling_completion_date_min"
        rename="Benchling Extraction Min Date"
        type="datetime"
        componentId="filter-one"
        {...speciesZone}
      />
      <div style={{ height: 6 }} />
      <Filter
        attribute="goat_taxon_rank"
        rename="Taxon Rank"
        type="multi"
        componentId="filter-one"
        {...speciesZone}
      />
      <div style={{ height: 6 }} />
      <Filter
        attribute="benchling_sequencing_request_count"
        rename="Request Count"
        type="int"
        componentId="filter-one"
        {...speciesZone}
      />
      <div style={{ height: 6 }} />
      <Filter
        attribute="sts_ready"
        rename="STS Ready"
        type="boolean"
        componentId="filter-one"
        {...speciesZone}
      />
      <p style={{ marginTop: 10, marginBottom: 3 }}>Filter Level 2:</p>
      <Filter
        attribute="sts_family"
        rename="Family Two"
        type="str"
        componentId="filter-two"
        {...speciesZone}
      />
      <p style={{ marginTop: 15, marginBottom: 10 }}>Filter Level 3:</p>
      <RemoteTable
        id="table-1"
        fields={{
          uid: {
            rename: "ID",
          },
          sts_family: {
            rename: "Family",
          },
          benchling_sequencing_request_count: {
            rename: "Request Count",
          },
          benchling_extraction_benchling_completion_date_min: {
            rename: "Benchling Ex. Min Date",
          },
          goat_taxon_rank: {
            rename: "Taxon Rank",
          },
          sts_ready: {
            rename: "STS Ready",
          },
        }}
        height={300}
        {...speciesZone}
      />
      <p style={{ marginTop: 15, marginBottom: 10 }}>Filter Level 4:</p>
      <RemoteTable
        id="table-2"
        fields={{
          uid: {
            rename: "ID",
          },
          sts_scientific_name: {
            rename: "Name",
          },
        }}
        height={300}
        {...speciesZone}
      />
      <p style={{ marginTop: 10 }}>Filter Level 5:</p>
      <div style={{ height: 110, marginTop: 20 }}>
        <RemoteCount
          id="count"
          utilityBarConfig={{
            title: {text: "Total Species"}
          }}
          {...speciesZone}
        />
      </div>
    </div>
  );

  const runDataMap = useZone({
    objectType: "barcoding_run_data",
    dataSource: tolDataSource,
    components: [
      {
        id: "map-filter",
        filter: {
          and_: {
            "sts_sample.id": {
              exists: {},
            },
          },
        },
      },
      { id: "map" },
    ],
  });

  const map = (
    <div>
      <h5 style={{ marginBottom: 10 }}>Map Example</h5>
      <Filter
        attribute="bioscan_o"
        rename="Order"
        type="str"
        componentId="map-filter"
        {...runDataMap}
      />
      <div style={{ height: 10 }} />
      <RemoteMap
        id="map"
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
    objectType: "barcoding_run_data",
    dataSource: tolDataSource,
    components: [
      {
        id: "sunburst-filter",
        filter: {
          and_: {
            "sts_sample.id": {
              exists: {},
            },
            bioscan_o: {
              contains: {
                value: "Lep",
              },
            },
          },
        },
      },
      { id: "sunburst" },
      { id: "sunburst-table" },
    ],
  });

  const sunburst = (
    <div>
      <h5 style={{ marginBottom: 10 }}>Sunburst Example</h5>
      <Filter
        attribute="bioscan_o"
        rename="Order"
        type="str"
        componentId="sunburst-filter"
        {...runDataSunburst}
      />
      <div style={{ height: 20 }} />
      <RemoteSunburst
        id="sunburst"
        utilityBarConfig={{
          title: {text: "Example Sunburst"}
        }}
        height={500}
        sliceBy={["bioscan_o", "bioscan_f", "bioscan_g", "bioscan_s"]}
        {...runDataSunburst}
      />
      <div style={{ height: 30 }} />
      <RemoteTable
        id="sunburst-table"
        defaultSort="bioscan_specimen.id"
        fields={{
          "bioscan_specimen.id": {
            rename: "Specimen ID",
            cellRenderer: null,
          },
          "sts_sample.id": {
            rename: "Sample",
            width: 150,
            cellRenderer: null,
          },
          bioscan_c: {
            rename: "Class",
          },
          bioscan_o: {
            rename: "Order",
          },
          bioscan_f: {
            rename: "Family",
          },
        }}
        height={400}
        {...runDataSunburst}
      />
    </div>
  );

  const runDataChart = useZone({
    objectType: "run_data",
    dataSource: tolDataSource,
    components: [{ id: "chart" }, { id: "chart-table" }],
  });

  const chart = (
    <div>
      <RemoteBarChart
        stacked
        id="chart"
        utilityBarConfig={{
          title: {text: "Run Data"}
        }}
        type="M"
        breakDownBy="mlwh_platform_type"
        xAxis="mlwh_run_complete"
        height={400}
        {...runDataChart}
      />
      <div style={{ height: 30 }} />
      <RemoteTable id="chart-table" height={400} {...runDataChart} />
    </div>
  );

  const speciesTranslatorZone = useZone({
    objectType: "species",
    dataSource: tolDataSource,
    components: [{ id: "sunburst-1" }, { id: "filter-1" }],
  });

  const sampleTranslatorZone = useZone({
    objectType: "sample",
    dataSource: tolDataSource,
    components: [{ id: "map-1" }],
  });

  useTranslator({
    excludeAfterId: "sunburst-1",
    source: speciesTranslatorZone,
    target: sampleTranslatorZone,
    translations: {
      goat_family_name: "sts_species.sts_family",
      goat_genus_name: "sts_species.sts_genus",
    },
  });

  const translatorComponent = (
    <div>
      <RemoteSunburst
        utilityBarConfig={{
          title: {text: "Example Sunburst"}
        }}
        id="sunburst-1"
        sliceBy={["goat_family_name", "goat_genus_name"]}
        height={400}
        {...speciesTranslatorZone}
      />
      <div style={{ height: 30 }} />
      <RemoteMap
        id="map-1"
        longitudeKey="sts_longitude"
        latitudeKey="sts_latitude"
        height={400}
        {...sampleTranslatorZone}
      />
      <div style={{ height: 10 }} />
      <Filter
        attribute="goat_family_name"
        rename="Family Name"
        type="str"
        componentId="filter-1"
        {...speciesTranslatorZone}
      />
    </div>
  );

  const components = [
    {
      component: <h2>Filters</h2>,
      type: "full",
    },
    {
      component: table,
      type: "full",
    },

  ];

  return <Widgets components={components} />;
}
