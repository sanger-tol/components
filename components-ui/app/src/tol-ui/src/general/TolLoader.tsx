/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Loader as RSLoader } from "rsuite";

interface Props {
  size?: string;
  content?: string;
  vertical?: boolean;
  styles?: React.CSSProperties;
}

function TolLoader(props: Props) {
  const { size, content, vertical, styles } = props;

  return (
    <div className="tol-loader" style={{ ...styles }}>
      <RSLoader
        // @ts-ignore
        size={size}
        content={content}
        vertical={vertical}
      />
    </div>
  );
}

export default TolLoader;
