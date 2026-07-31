/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "..";
import type { PButton } from "..";

export interface PExpandButton extends PButton {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export function ExpandButton(props: PExpandButton) {
  const { expanded, setExpanded, ...buttonProps } = props;
  const propsToPassOn = {
    ...buttonProps,
    onClick: () => {
      props.onClick?.();
      setExpanded(!expanded);
    }
  };

  return (
    <Button
      outline
      icon={expanded ? "angle-up" : "angle-down"}
      tooltip={expanded ? "Collapse" : "Expand"}
      {...propsToPassOn}
    />
  )
}
