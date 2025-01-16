/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';
import { Button } from '../tol-ui/src/general';


function Sandbox() {
  const [active, setActive] = useState(false);

  return (
    <Button
      icon='wifi'
      onClick={() => setActive(!active)}
      type='primary'
      active={active}
      text='TEST'
      size='md'
      outline
      disabled
    />
  );
}

export default Sandbox;
