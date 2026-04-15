/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  PButton,
  PCellDisplay
} from "../..";


export interface PLink extends PCellDisplay {
  url: string;
  text?: string;
  newTab?: boolean;
  buttonConfig?: PButton;
}

export function Link(props: PLink) {
  const { url, text, newTab, buttonConfig } = props;
  const t = text || url;

  const isExternal = () => {
    return /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(url);
  };

  const openInNewTab = newTab !== undefined ? newTab : isExternal();
  
  const handleClick = () => {
    if (openInNewTab) {
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
  
  return openInNewTab ? (
    <a href={url} target="_blank" rel="noopener noreferrer">{t}</a>
  ) : (
    <a href={url}>{t}</a>
  );
}
