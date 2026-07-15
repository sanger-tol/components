/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  Button,
  generateSdkScript,
  IFilter,
  copyToClipboard
} from "../..";
import { SdkInstructions } from ".";

export interface PSdkTab {
  source: string,
  filter: IFilter,
  objectType: string
}

export function SdkTab(props: PSdkTab) {
  const {
    source,
    filter,
    objectType
  } = props;
  const sourceToUse = source || "tol_production";

  const SDKText = generateSdkScript(sourceToUse, filter, objectType)

  return (
    <>
      <div className="tol-code-block">
        <CodeBlock
          text={SDKText}
          language="python"
          showLineNumbers={false}
        />
      </div>
      <br />
      <Button
        onClick={() => copyToClipboard(SDKText.trim())}
        icon="copy"
        text="Copy to Clipboard"
      />
      <br />
      <SdkInstructions/>
    </>
  );
}
