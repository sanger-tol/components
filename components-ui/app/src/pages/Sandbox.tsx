/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents, Modal } from '../tol-ui/src'
import { useState } from 'react';

function Sandbox() {
  const [open, setOpen] = useState(false)
  return (
    <div className="sandbox">
      <CentreContents>
        <h3>Just a place to test components. Remember to uncomment the page in components-ui/app/src/index.tsx</h3>
      </CentreContents>
      <Modal
        size='full'
        open={open}
        setOpen={setOpen}
      >
        <p>this is a test</p>
      </Modal>
      <Button onClick = {() => setOpen(true)}>Open</Button>
    </div>
  );
}

export default Sandbox;