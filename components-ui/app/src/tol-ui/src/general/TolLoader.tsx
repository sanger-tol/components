/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader as RSLoader } from "rsuite";

export interface PTolLoader {
  size?: string;
  content?: string;
  vertical?: boolean;
}

export function TolLoader(props: PTolLoader) {
  const { size, content, vertical } = props;

  return (
    <div className="tol-loader">
      <RSLoader
        // @ts-ignore
        size={size}
        content={content}
        vertical={vertical}
      />
    </div>
  );
}
