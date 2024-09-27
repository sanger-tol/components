/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  TsDataSource,
  DetailAttribute,
  Widgets,
  env
} from '../tol-ui/src';


function DataSource() {
  const ds1 = new TsDataSource({baseUrl: env.TOL_DATA});

  ds1.getOne({
    objectType: 'species',
    id: '9606'
  }).then((dataObject) => {
    console.log(dataObject);
  });

  ds1.getByIds({
    objectType: 'species',
    ids: ['9606', 'abc', '9606']
  }).then((dataObjects) => {
    console.log(dataObjects);
  });

  ds1.attributeMetadata().then(data => {
    console.log('Attribute Metadata:', data);
  }).catch(error => {
    console.error('Error fetching attribute metadata (portal):', error);
  });

  ds1.relationshipConfig().then(data => {
    console.log('Relationship Config:', data);
  }).catch(error => {
    console.error('Error fetching relationship config (portal):', error);
  });

  ds1.getEntityMeta().then(data => {
    console.log('Entity Meta (w/ flattened attributes) (portal):', data);
  }).catch(error => {
    console.error('Error fetching entityMeta:', error);
  });

  const ds2 = new TsDataSource();

  ds2.attributeMetadata().then(data => {
    console.log('Attribute Metadata:', data);
  }).catch(error => {
    console.error('Error fetching attribute metadata:', error);
  });

  ds2.relationshipConfig().then(data => {
    console.log('Relationship Config:', data);
  }).catch(error => {
    console.error('Error fetching relationship config (portal):', error);
  });

  ds2.getEntityMeta().then(data => {
    console.log('Entity Meta (w/ flattened attributes) (portal):', data);
  }).catch(error => {
    console.error('Error fetching entityMeta:', error);
  });

  const dataSource = (
    <h5>See console for TSDataSource examples...</h5>
  );

  const detailAttribute = (
    <div>
      <h5>DetailAttribute</h5>
      Fetching a detail endpoint attribute with loading. These are usually used in table cells.
      <DetailAttribute
        id="9606"
        endpoint="species"
        attribute="id"
        baseUrl={env.TOL_DATA}
      />
      <DetailAttribute
        id="9606"
        endpoint="species"
        attribute="tolid_prefix"
        baseUrl={env.TOL_DATA}
      />
      <DetailAttribute
        id="9606"
        endpoint="species"
        attribute="sts_order_group"
        baseUrl={env.TOL_DATA}
      />
    </div>
  );

  const components = [
    {
      component: dataSource,
      type: 'full'
    },
    {
      component: detailAttribute,
      type: 'full'
    }
  ];

  return (
    <div className="datasource">
      <Widgets
        components={components}
      />
    </div>
  );
}

export default DataSource;
