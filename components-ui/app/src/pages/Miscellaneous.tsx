/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal } from '../tol-ui/src';
import { useState } from 'react';


function Miscellaneous() {
  const [open, setOpen] = useState(false)

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
      </CentreContents>
    </div>
  );
}

export default Miscellaneous;
