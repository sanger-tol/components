/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";


export function SdkInstructions() {

  return (
    <>
      <p>
        To use this code snippet you'll need to have the ToL Python SDK installed in your
        Python environment:
      </p>
      <div className="tol-code-block">
        <CodeBlock
          text="pip install tol-sdk"
          language="bash"
          showLineNumbers={false}
        />
      </div>
    </>
  );
}
