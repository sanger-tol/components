/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  env
} from '../tol-ui/src';
import TsDataSource from '../tol-ui/src/services/http/tsDataSource';


function Sandbox() {

  const ds = new TsDataSource({
    baseUrl: env.TOL_DATA
  });

  ds.getEntityMeta({
    objectType: 'species'
  }).then((dataObject) => {
    console.log(dataObject);
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
    <div>
    </div>
  );
}

export default Sandbox;
