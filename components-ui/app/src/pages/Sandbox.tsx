/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { env, RemoteTable, Widgets } from '../tol-ui/src';
import Filter from '../tol-ui/src/general/Filter';


function Sandbox() {
  //const [filter, setFilter] = useState<object>({'contains': {'sts_common_name': 'Pink'}})
  const [filter, setFilter] = useState<object>({});

  /*
  const table1 = (
    <RemoteTable
      id="tester12"
      endpoint="extraction"
      height={500}
      baseUrl={env.TOL_DATA}
      filter={filter}
      setFilter={setFilter}
    />
  )
  */

  const table2 = (
    <RemoteTable
      id="run-data-table-v2"
      endpoint="run_data"
      baseUrl={env.TOL_DATA}
      filter={filter}
      setFilter={setFilter}
      height={500}
      fields={{
        "tolqc_run_id": {
          rename: "Run ID",
          width: 100
        },
        "tolqc_species.sts_scientific_name": {
          rename: "Species"
        },
        "tolqc_sequencing_request.id": {
          rename: "Sequencing Request",
          relationshipBox: true
        },
        "mlwh_complete_date": {
          rename: "Complete Date"
        },
        "mlwh_platform_type": {
          rename: "Platform"
        },
        "mlwh_instrument_model": {
          rename: "Instrument"
        },
        "tolqc_position": {
          rename: "Position"
        },
        "tolqc_tag_index": {
          rename: "Tag"
        }
      }}
    />
  );
  
  return (
    <>
      <Filter
        id='sts_tol_updated_at'
        rename='sts_tol_updated_at'
        type='datetime'
        filter={filter}
        setFilter={setFilter}
      />
      <Filter
        id='sts_species_id'
        rename='sts_species_id'
        type='int'
        filter={filter}
        setFilter={setFilter}
      />
      <Filter
        id='sts_ready'
        rename='sts_ready'
        type='boolean'
        filter={filter}
        setFilter={setFilter}
      />
      <Widgets
        components={[table2]}
      />
    </>
  );
}

export default Sandbox;
