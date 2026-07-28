/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  Button,
  generateSdkScript,
  IFilter,
  TsDataSource,
  copyToClipboard
} from "../..";
import { SdkInstructions } from ".";

export interface PSdkTab {
  dataSource?: TsDataSource,
  filter: IFilter,
  objectType: string
}

export function SdkTab(props: PSdkTab) {
  const {
    dataSource,
    filter,
    objectType
  } = props;

  const SDKText = generateSdkScript(
    dataSource?.getDataSourceInstanceId(),
    filter,
    objectType
  )

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
