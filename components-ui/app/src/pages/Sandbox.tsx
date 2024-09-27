/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

function Sandbox() {

  const ds1 = new TsDataSource({
    baseUrl: env.TOL_DATA
  });

  const ds2 = new TsDataSource({
    baseUrl: env.TOL_DATA
  });

  ds1.attributeMetadata().then(data => {
    console.log('Attribute Metadata:', data);
  }).catch(error => {
    console.error('Error fetching attribute metadata:', error);
  });

  ds1.relationshipConfig().then(data => {
    console.log('Relationship Config:', data);
  }).catch(error => {
    console.error('Error fetching relationship config:', error);
  });

  ds2.attributeMetadata().then(data => {
    console.log('Attribute Metadata:', data);
  }).catch(error => {
    console.error('Error fetching attribute metadata:', error);
  });

  ds2.attributeMetadata().then(data => {
    console.log('Attribute Metadata:', data);
  }).catch(error => {
    console.error('Error fetching attribute metadata:', error);
  });

  ds2.getEntityMeta().then(data => {
    console.log('Entity Metadata:', data);
  }).catch(error => {
    console.error('Error fetching entity metadata:', error);
  });

  /*
  ds.getById({
    objectType: 'species',
    id: '9606'
  }).then((dataObject) => {
    console.log(dataObject);
  });

  
  ds.getByIds({
    objectType: 'species',
    ids: ['9606', 'abc', '9606']
  }).then((dataObjects) => {
    console.log(dataObjects);
  });

*/
  ds.getListPage({
    objectType: 'species',
    pageSize: 50,
    page: 3,
    sortBy: 'sts_scientific_name'
  }).then((dataObjects) => {
    console.log(dataObjects);
    ds.getById({
      objectType: 'species',
      id: '644'
    }).then((dataObject) => {
      console.log(dataObject?.sts_scientific_name);
    });
  });

  return (
    <div className="sandbox">
      This is a coding sandbox.
    </div>
  );
}

export default Sandbox;
