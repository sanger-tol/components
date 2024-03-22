/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Map, RemoteMap, Widgets, env } from "../tol-ui/src";


function Maps() {
  // fake data for BubbleMap component
  const points = [[51.508530, -0.076132],[51.510357, -0.116773],[51.507359, -0.136439],[53.958332, -1.080278],
    [52.192001,-2.220000],[51.063202, -1.308000]];

  let lat = 51.063202;
  let long = -1.308000;
  for (let i=0; i<20; i++){
    lat += 0.0001;
    long += 0.0001;
    points.push([lat, long]);
  }

  // create the marker objects from the fake data that the bubblemap receives
  function createMapObjectsFromCoordinates(coordinatesArray) {
    const mapObjects = coordinatesArray.map(coordinates => {
      return {
        geometry: {
          coordinates: coordinates
        },
        properties: {}
      };
    });
    return mapObjects;
  }

  const mapObjects = createMapObjectsFromCoordinates(points);

  const map = (
    <div>
      <h2 style={{marginBottom: 10}}>
        Map
      </h2>
      <Map markers={mapObjects} height={400}/>
    </div>
  );

  const bubble = (
    <div>
      <h2 style={{marginBottom: 10}}>
        Bubble Map
      </h2>
      <Map bubble markers={mapObjects} height={400}/>
    </div>
  );

  const remoteBubble = (
    <div>
      <h2 style={{marginBottom: 10}}>
        Remote Bubble Map
      </h2>
      <RemoteMap
        bubble
        endpoint="sample"
        longitudeKey="sts_latitude"
        latitudeKey="sts_longitude"
        baseUrl={env.TOL_DATA}
        height={400}
      />
    </div>
  );

  const components = [
    {
      component: map,
      type: 'full'
    },
    {
      component: bubble,
      type: 'full'
    },
    {
      component: remoteBubble,
      type: 'full'
    },
  ];

  return (
    <Widgets
      components={components}
    />
  );
}

export default Maps;
