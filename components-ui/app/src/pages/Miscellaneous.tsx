/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal, DnD, ObjectDetail, InfoTooltip } from '../tol-ui/src';
import { useState } from 'react';

const jsonData = {
  "Common name": "Human",
  "Family": "Hominidae",
  "Genus": "Homo",
  "Order": "Primates",
  "Scientific Name": "Homo sapiens",
  "STS Species ID": 5443,
};


function Miscellaneous() {
  const [modalOpen, setModalOpen] = useState(false);
  const [contents, setContents] = useState();

  console.log(contents);

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
          
        <h2 className='mt-5'>Info Tooltip</h2>
        <InfoTooltip contents="This is some information!" />

        <h2 className='mt-5'>Object Detail</h2>
        <ObjectDetail data={jsonData}/>

        <h2 className='mt-5'>Drag & Drop</h2>
        <div className='mb-5'>
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
        </div>
      </CentreContents>
    </div>
  );
}

export default Miscellaneous;
