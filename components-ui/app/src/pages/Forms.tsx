/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Form,
         CentreContents,
         RemoteAutoComplete,
         MultipleSelect,
         MultipleSelectFilters,
         RemoteMultipleSelectFilters,
         Dropzone,
         Filter,
         env } from '../tol-ui/src';    
    
function Forms() {
  const [value, setValue] = useState([])
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}})
  const [choices1, setChoices1] = useState<any[]>([])
  const [choices2, setChoices2] = useState<any[]>([])
  const [remoteFilters, setRemoteFilters] = useState<object>({in_list: {}})
  const [filter, setFilter] = useState<object>({})

  // Used as data for the MultipleSelectFilters
  const filters = [
    {
      name: 'test filter 1',
      choices: ['t1', 't2', 't3'],
      selected: choices1,
      setChoices: setChoices1
    },
    {
      name: 'test filter 2',
      choices: ['t1', 't2', 't3'],
      selected: choices2,
      setChoices: setChoices2
    }
  ];

  return (
    <div>
      <CentreContents>
        <h2>Filters</h2>
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
        <h2>AutoComplete Input</h2>
        <RemoteAutoComplete 
          endpoint='species'
          filter_by='name'
          display={['family', 'genus']}
        />
        <br/>
        <h2>Multiple Select</h2>
        <MultipleSelect
          placeholder="Select"
          data={['test1','test2','test3']}
          value={value}
          setValue={setValue}/>
        <br/>
        <h2>Bootstrap Form</h2>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="name@example.com" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Example textarea</Form.Label>
            <Form.Control as="textarea" rows={3} />
          </Form.Group>
        </Form>
        <br/>
        <h2>Multiple Select Filters</h2>
        <MultipleSelectFilters value={globalFilters} setValue={setGlobalFilters} filters={filters}/>
        <br/>
        <h2>Remote Multiple Select Filters</h2>
        <RemoteMultipleSelectFilters
          endpoint='run_data'
          fields={['mlwh_platform_type', 'mlwh_run_status', 'mlwh_instrument_model']}
          renamedFields={{'mlwh_platform_type':'test1', 'mlwh_run_status':'test2', 'mlwh_instrument_model':'test3'}}
          globalFilters={remoteFilters}
          setGlobalFilters={setRemoteFilters}
          baseUrl={ env.TOL_DATA }
        />
        <br/>
        <h2>Dropzone</h2>
        <Dropzone
          endpoint='this-is-fake'
          fileType='.csv'
          generateMessages={() => {return []}}
        />
      </CentreContents>
    </div>
  );
}

export default Forms;
    