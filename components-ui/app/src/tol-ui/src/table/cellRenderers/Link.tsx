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

  const isExternal = () => {
    return /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(url);
  };

  const handleClick = () => {
    if (isExternal()) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  if (buttonConfig) {
    return (
      <Button
        text={t}
        onClick={handleClick}
        {...buttonConfig}
      />
    );
  }

  return isExternal() ? (
    <a href={url} target="_blank" rel="noopener noreferrer">{t}</a>
  ) : (
    <a href={url}>{t}</a>
  );
}
