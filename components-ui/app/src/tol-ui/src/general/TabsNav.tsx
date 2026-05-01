/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";

export interface PTabsNav {
  buttons: PButton[]
}

export function TabsNav(props: PTabsNav) {
  const { buttons } = props;

  return (
    <div className="tol-tabs-nav">
      {buttons.map((button, index) => (
        <Button
          key={index}
          {...button}
        />
      ))}
    </div>
  );
}
