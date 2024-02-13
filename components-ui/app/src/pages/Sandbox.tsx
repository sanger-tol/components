/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ResponsiveWidget
} from '../tol-ui/src';


function Sandbox() {

  const title = (
    <span>
      <h2>Report Card</h2>
    </span>
  );

  return (
    <ResponsiveWidget components={[title]}/>
  );
}

export default Sandbox;
