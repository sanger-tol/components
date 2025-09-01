/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  PButton,
  PCell
} from "../..";


export interface PLink extends PCell {
  url: string;

  text?: string;
  buttonConfig?: PButton;
}

export function Link(props: PLink) {
  const { value, url, text, buttonConfig } = props;

  const t = text || value;

  if (buttonConfig) {
    return (
      <Button
        text={t}
        onClick={() => window.open(url, "_blank")}
        {...buttonConfig}
      />
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {t}
    </a>
  );
}
