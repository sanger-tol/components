/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BubbleMap, CentreContents } from "../tol-ui/src";

    
function Maps() {

  const points = [[51.508530, -0.076132],[51.510357, -0.116773],[51.507359, -0.136439],[53.958332, -1.080278],
                  [52.192001,-2.220000],[51.063202, -1.308000]]

  let lat = 51.063202
  let long = -1.308000
  for (let i=0; i<20; i++){
    lat += 0.0001
    long += 0.0001
    points.push([lat, long])
  }

  return (
    <CentreContents>
      <h2>Bubble Map</h2>
      <BubbleMap points={points} height={400}/>
    </CentreContents>
  );
}

export default Maps;
    