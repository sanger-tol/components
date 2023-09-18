/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal, DnD } from '../tol-ui/src';
import { useState } from 'react';


function Miscellaneous() {
  const [modalOpen, setModalOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

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
          <Modal
            size='full'
            open={compareOpen}
            setOpen={setCompareOpen}
          >
            <DnD
              leftList={['item 1', 'item 2', 'item 3']}
              rightList={['item 4', 'item 5', 'item 6']}
            />
          </Modal>
          <Button style={{marginLeft: 6}} onClick = {() => setCompareOpen(true)}>Compare Drag & Drop</Button>
      </CentreContents>
    </div>
  );
}

export default Miscellaneous;
