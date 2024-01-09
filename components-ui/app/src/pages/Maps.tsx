/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BubbleMap, CentreContents, RemoteBubbleMap, RemoteBubbleMapFilter, env } from "../tol-ui/src";


function Maps() {
  // fake data for BubbleMapp component
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

  return (
    <CentreContents>
      <h2>Bubble Map</h2>
      <BubbleMap markers={mapObjects} height={400}/>
      <h2 className="mt-5">Remote Bubble Map</h2>
      <RemoteBubbleMap
        endpoint="sample"
        longitudeKey="sts_latitude"
        latitudeKey="sts_longitude"
        height={400}
        baseUrl={ env.TOL_DATA }
      />
      <h2 className="mt-5">Remote Bubble Map with Filters</h2>
      <RemoteBubbleMapFilter
        endpoint="map_objs"
        longitudeKey="ene_map_test_longitude"
        latitudeKey="ene_map_test_latitude"
        height={400}
        filterInputFields={['ene_map_test_checksum']}
        attributeKeys="ene_map_test_tol_updated_at, ene_map_test_longitude"
        baseUrl={ env.TOL_DATA }
      />
    </CentreContents>
  );
}

export default Maps;
