/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Map, Widgets, RemoteMap, useZone, TOL_DS } from "../tol-ui/src";

export function Maps() {
  // fake data for BubbleMap component
  const points = [
    [51.50853, -0.076132],
    [51.510357, -0.116773],
    [51.507359, -0.136439],
    [53.958332, -1.080278],
    [52.192001, -2.22],
    [51.063202, -1.308],
  ];

  let lat = 51.063202;
  let long = -1.308;
  for (let i = 0; i < 20; i++) {
    lat += 0.0001;
    long += 0.0001;
    points.push([lat, long]);
  }

  // create the marker objects from the fake data that the bubblemap receives
  function createMapObjectsFromCoordinates(coordinatesArray) {
    const mapObjects = coordinatesArray.map((coordinates) => {
      return {
        geometry: {
          coordinates: coordinates,
        },
        properties: {},
      };
    });
    return mapObjects;
  }

  const mapObjects = createMapObjectsFromCoordinates(points);

  const map = (
    <div>
      <h2 style={{ marginBottom: 10 }}>Map</h2>
      <Map id="1" markers={mapObjects} height={400} />
    </div>
  );

  const bubble = (
    <div>
      <h2 style={{ marginBottom: 10 }}>Bubble Map</h2>
      <Map id="2" bubble markers={mapObjects} height={400} />
    </div>
  );

  const cardZone = useZone({
    objectType: "sample", // TODO: get correct object type from Andrew
    dataSource: TOL_DS,
    components: [
      {
        id: "report-card-map-v1",
        filter: {
          and_: {
            "sts_species.sts_family": {
              contains: {
                value: "La",
                negate: false,
              },
            },
          },
        },
      },
    ],
  });

  const activeChecker = (rowData) => {
    if (rowData.attributes.bioscan_o === "Polydesmida") {
      return {
        colour: "blue",
        key: "active",
      };
    } else {
      return {
        colour: "grey",
        key: "inactive",
      };
    }
  };

  const remoteMap = (
    <div>
      <RemoteMap
        id="report-card-map-v1"
        bubble
        longitudeKey="sts_longitude.keyword"
        latitudeKey="sts_latitude.keyword"
        attributeKeys="sts_longitude"
        markerRenderer={activeChecker}
        height={400}
        {...cardZone}
      />
    </div>
  );

  const components = [
    {
      component: map,
      type: "full",
    },
    {
      component: bubble,
      type: "full",
    },
    {
      component: remoteMap,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
