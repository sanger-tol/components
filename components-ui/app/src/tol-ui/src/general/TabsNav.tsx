/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";

export interface PTabsNav {
  buttons: PButton[]
  className: string;
}

export function TabsNav(props: PTabsNav) {
  const { buttons, className } = props;

  return (
    <div className={`tol-tabs-nav ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          {...button}
        />
      ))}
    </div>
  );
}
