/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer } from "../general";
import { IConfigDrawer } from "./interfaces";

function ConfigDrawer(props: IConfigDrawer) {
  const { open, setOpen, title, children } = props;
  return (
    <div>
      <Drawer title={title} open={open} setOpen={setOpen} children={children} />
    </div>
  );
}

export default ConfigDrawer;
