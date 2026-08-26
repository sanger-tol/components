/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "..";
import type { PButton } from "..";

export interface PExpandButton extends PButton {
  /**
   * Whether the content this button controls is expanded
   */
  expanded: boolean;
  /**
   * Callback used to update the expanded state
   */
  setExpanded: (expanded: boolean) => void;
}

/**
 * A toggle button that switches between expanded and collapsed states
 */
export function ExpandButton(props: PExpandButton) {
  const { expanded, setExpanded, ...buttonProps } = props;
  const propsToPassOn = {
    ...buttonProps,
    onClick: () => {
      buttonProps.onClick?.();
      setExpanded(!expanded);
    }
  };

  return (
    <Button
      outline
      icon={expanded ? "angle-up" : "angle-down"}
      tooltip={expanded ? "Collapse" : "Expand"}
      className="tol-expand-button"
      {...propsToPassOn}
    />
  )
}
