/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Loader as RSLoader } from "rsuite";

export interface PTolLoader {
  size?: string;
  content?: string;
  vertical?: boolean;
  styles?: React.CSSProperties;
  className?: string;
}

export function TolLoader(props: PTolLoader) {
  const { size, content, vertical, styles, className } = props;
  return (
    <div className={`tol-loader ${className ?? ""}`} style={{ ...styles }}>
      <RSLoader
        // @ts-ignore
        size={size}
        content={content}
        vertical={vertical}
      />
    </div>
  );
}
