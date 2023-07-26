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
         Dropzone } from '../tol-ui/src';    
    
function Forms() {
  const [value, setValue] = useState(['test2'])
  const [globalFilters, setGlobalFilters] = useState<object>({})
  const [choices1, setChoices1] = useState<any[]>([])
  const [choices2, setChoices2] = useState<any[]>([])
  const [remoteFilters, setRemoteFilters ] = useState<object>({})

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
        <h2>AutoComplete Input</h2>
        <RemoteAutoComplete 
          endpoint='species'
          filter_by='name'
          display={['family', 'genus']}
        />
        <br/>
        <h2>Multiple Select</h2>
        <MultipleSelect data={['test1','test2','test3']} setValue={setValue} value={value} placeholder="Select"/>
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
          fields={['mlwh_platform_type', 'mlwh_run_status']}
          globalFilters={remoteFilters}
          setGlobalFilters={setRemoteFilters}
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
    