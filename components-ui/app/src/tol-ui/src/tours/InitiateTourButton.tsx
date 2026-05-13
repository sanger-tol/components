/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "..";

export interface PInitiateTourButton {
  onClick: () => void;
}

export function InitiateTourButton(props: PInitiateTourButton) {
  const { onClick } = props;

  return (
    <button className="InitiateTourButton" onClick={onClick}>
      <Icon icon="circle-question" size="lg" />
    </button>
  )
}
