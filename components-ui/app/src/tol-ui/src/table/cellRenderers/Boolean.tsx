/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCellDisplay,
  StatusMessage
} from "../..";


export function Boolean(props: PCellDisplay) {
  const { value } = props;

  switch (value) {
    case true:
      return <StatusMessage message="True" status="success" />;
    case false:
      return <StatusMessage message="False" status="error" />;
  }
  return null;
}
