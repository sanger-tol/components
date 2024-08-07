/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  Filter,
  RemoteMap,
  RemoteSunburst,
  Widgets,
  env,
  useZone,
  useTranslator
} from '../tol-ui/src';


function Sandbox() {
  const speciesZone = useZone({
    endpoint: 'species',
    baseUrl: env.TOL_DATA,
    components: [
      {id: 'filter-1'},
      {id: 'sunburst-1'}
    ]
  });

  const sampleZone = useZone({
    endpoint: 'sample',
    baseUrl: env.TOL_DATA,
    components: [
      {id: 'map-1'}
    ]
  });

  useTranslator({
    source: speciesZone,
    target: sampleZone,
    translations: {
      goat_family_name: 'sts_species.sts_family',
      goat_genus_name: 'sts_species.sts_genus'
    }
  })

  const speciesComponent = (
    <div>
      <Filter
        attribute='goat_family_name'
        rename='Family Name'
        type='str'
        componentId='filter-1'
        {...speciesZone}
      />
      <div style={{height: 10}}/>
      <RemoteSunburst
        title="Example Sunburst"
        id="sunburst-1"
        sliceBy={[
          "goat_family_name",
          "goat_genus_name"
        ]}
        height={400}
        {...speciesZone}
      />
    </div>
  );

  const sampleComponent = (
    <RemoteMap
      id='map-1'
      longitudeKey="sts_longitude"
      latitudeKey="sts_latitude"
      {...sampleZone}
    />
  );

  const components = [
    {
      component: speciesComponent,
      type: 'full'
    },
    {
      component: sampleComponent,
      type: 'lg'
    }
  ]

  return <Widgets components={components} />;
}

export default Sandbox;
