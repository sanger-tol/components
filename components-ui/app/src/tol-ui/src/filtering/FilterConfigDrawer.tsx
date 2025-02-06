/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer } from "../general";
import {IFilterDrawer} from "../models/table";

function FilterDrawer(props: IFilterDrawer) {
  const { open, setOpen } = props;
  return (
    <div>
      <Drawer title={"Filter"} open={open} setOpen={setOpen} />
    </div>
  );
}

export default FilterDrawer;
