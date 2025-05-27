/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer } from "..";

interface Props {
  open: boolean;
  setOpen: () => void;
}

export function FilterDrawer(props: Props) {
  const { open, setOpen } = props;
  return (
    <div>
      <Drawer title={"Filter"} open={open} setOpen={setOpen} />
    </div>
  );
}
