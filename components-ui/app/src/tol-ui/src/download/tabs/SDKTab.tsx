/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  Button,
  generateSDKScript,
  IFilter,
  copyToClipboard
} from "../..";
import { SDKInstructions } from ".";

export interface PSDKTab {
  source: string,
  filter: IFilter,
  objectType: string
}

export function SDKTab(props: PSDKTab) {
  const {
    source,
    filter,
    objectType
  } = props;
  const sourceToUse = source || "portal";

  const SDKText = generateSDKScript(sourceToUse, filter, objectType)

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
      <SDKInstructions/>
    </>
  );
}
