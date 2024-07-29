/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  env
} from '../tol-ui/src';
import { TsDataSource } from '../tol-ui/src/services/http/tsDataSource';


function Sandbox() {

  const ds = new TsDataSource({
    baseUrl: env.TOL_DATA
  });

  ds.getById({
    objectType: 'species',
    id: '9606'
  }).then((dataObject) => {
    console.log(dataObject!.sts_scientific_name);
  });

  ds.getByIds({
    objectType: 'species',
    ids: ['9606', '10090']
  }).then((dataObjects) => {
    dataObjects.forEach((dataObject) => {
      console.log(dataObject!.sts_scientific_name);
    })
  });

  return (
    <div>
    </div>
  );
}

export default Sandbox;
