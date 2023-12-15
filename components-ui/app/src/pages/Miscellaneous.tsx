/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal, DnD, env } from '../tol-ui/src';
import { useState } from 'react';
import ObjectDetail from '../tol-ui/src/general/ObjectDetail';
import RemoteObjectDetail from '../tol-ui/src/general/RemoteObjectDetail';

const jsonData = {
      "common_name": "Humans",
      "family": "Hominidae",
      "genus": "Homo",
      "order": "Primates",
      "scientific_name": "Homo sapiens",
      "sts_species_id": 5443,
}


function Miscellaneous() {
  const [modalOpen, setModalOpen] = useState(false)
  const [contents, setContents] = useState()
  const [filter, setFilter] = useState({contains: {uid: '1000418'}})
  console.log(contents)
  console.log(filter)

  return (
    <div>
      <CentreContents>
          <h2>Modal</h2>
          <Modal
            size='full'
            open={modalOpen}
            setOpen={setModalOpen}
          >
            <h2>Test Modal</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer est leo, blandit
              quis justo eu, tempus condimentum mauris. Suspendisse condimentum eu sapien 
              pellentesque pharetra. Sed in tincidunt dui, ac euismod nisi. Nullam lobortis 
              non metus ac bibendum. Maecenas a arcu consectetur, congue augue vitae, tempor 
              purus. Maecenas quis feugiat risus, ut ultricies felis. Sed non nulla nisi. Fusce 
              faucibus massa quis dignissim sodales. Cras sed sapien nec elit porttitor auctor. 
              Donec at ultricies velit.
            </p>
          </Modal>
          <Button onClick = {() => setModalOpen(true)}>Example Modal</Button>
          
          <h2 className='mt-5'>Object Detail</h2>
          <ObjectDetail data={jsonData}/>

          <h2 className='mt-5'>Remote Object Detail</h2>
          <RemoteObjectDetail
            endpoint='species'
            baseUrl={ env.TOL_DATA }
            filter={ filter }
            fields={{
              "uid": {
                rename: "Taxonomy ID"
              },
              "sts_common_name": {
                rename: "Common Name"
              },
              "sts_family": {
                rename: "Family"
              },
              "sts_order_group": {
              },
              "sts_prefix": {
                rename: "ToLID prefix"
              },
              "sts_pacbio_submitted_date": {
                rename: "Pacbio Submission Date"
              }
            }}
            />

          <h2 className='mt-5'>Drag & Drop</h2>
          <h5>DnD Contents: </h5>
          <DnD
            elements={{
              one: [
                {id: 'hello-div', element: <div className='tol-dnd-item'>Hello</div>},
                {id: 'bye-div', element: <div className='tol-dnd-item'>Bye</div>},
                {id: 'test-div', element: <div className='tol-dnd-item'>Test</div>}
              ],
              two: [
                {id: 'dog-div', element: <div className='tol-dnd-item'>Dog</div>},
                {id: 'cat-div', element: <div className='tol-dnd-item'>Cat</div>},
                {id: 'mouse-div', element: <div className='tol-dnd-item'>Mouse</div>}
              ]
            }}
            setContents={setContents}
          />
      </CentreContents>
    </div>
  );
}

export default Miscellaneous;
