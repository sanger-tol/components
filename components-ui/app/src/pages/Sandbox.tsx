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

  ds.getList({
    objectType: 'species'
  }).then((dataObject) => {
    console.log(dataObject);
  });

  return (
    <div>
    </div>
  );
}

export default Sandbox;
