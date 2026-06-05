/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "..";

export interface PInitiateTourButton {
  onClick: () => void;
  testid: string;
}

export function InitiateTourButton(props: PInitiateTourButton) {
  const { onClick, testid } = props;

  return (
    <button
      className="InitiateTourButton"
      onClick={onClick}
      data-testid={testid}
    >
      <Icon icon="circle-question" size="lg" />
    </button>
  )
}
