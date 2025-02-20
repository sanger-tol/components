/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader as RSLoader } from "rsuite";

interface Props {
  size?: string;
  content?: string;
  vertical?: boolean;
}

function TolLoader(props: Props) {
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

export default TolLoader;
