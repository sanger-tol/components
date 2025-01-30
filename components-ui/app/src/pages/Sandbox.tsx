/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { ConfigDrawer } from "../tol-ui/src/components";
import { Button } from "../tol-ui/src";

function Sandbox() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button text="Open Modal" onClick={() => setOpen(!open)} />
      <ConfigDrawer
        open={open}
        setOpen={setOpen}
        title="Add/Remove Table Columns"
      />
    </>
  );
}
export default Sandbox;
