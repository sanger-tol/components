/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteSunburst } from "../tol-ui/src";

function Sandbox() {

  const speciesSunburst = (
    <RemoteSunburst
      id="home-species-sunburst-v1"
      endpoint="species"
      title="Species"
      sliceBy={["sts_order_group", "sts_family"]}
      legendPosition="left"
    />
  );

  return (<>
    {speciesSunburst}
  </>);
}

export default Sandbox;
