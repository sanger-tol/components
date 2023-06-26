/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Form, CentreContents, Modal, RemoteAutoComplete, MultipleSelect, MultipleSelectFilters } from '../tol-ui/src';
import { useState } from 'react';


function Miscellaneous() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(['test2'])
    const [globalFilters, setGlobalFilters] = useState<object>({})
    const [choices1, setChoices1] = useState<any[]>([])
    const [choices2, setChoices2] = useState<any[]>([])

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
            <h2>Modal</h2>
            <Modal
              size='full'
              open={open}
              setOpen={setOpen}
            >
              <h2>Test Modal</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer est leo, blandit
                 quis justo eu, tempus condimentum mauris. Suspendisse condimentum eu sapien 
                 pellentesque pharetra. Sed in tincidunt dui, ac euismod nisi. Nullam lobortis 
                 non metus ac bibendum. Maecenas a arcu consectetur, congue augue vitae, tempor 
                 purus. Maecenas quis feugiat risus, ut ultricies felis. Sed non nulla nisi. Fusce 
                 faucibus massa quis dignissim sodales. Cras sed sapien nec elit porttitor auctor. 
                 Donec at ultricies velit.</p>
            </Modal>
            <Button onClick = {() => setOpen(true)}>Click Here</Button>
            <h2>AutoComplete input</h2>
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
            <h2>Global filters</h2>
            <MultipleSelectFilters value={globalFilters} setValue={setGlobalFilters} filters={filters}/>
        </CentreContents>
      </div>
    );
}

export default Miscellaneous;
