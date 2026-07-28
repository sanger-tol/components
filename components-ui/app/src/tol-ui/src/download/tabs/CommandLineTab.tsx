/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  Button,
  IFilter,
  IRemoteTarget,
  copyToClipboard,
  generateCLICommand
} from "../..";
import { SdkInstructions } from ".";

export interface PCommandLineTab extends IRemoteTarget {
  filter: IFilter,
  requestedFields: string[]
}

export function CommandLineTab(props: PCommandLineTab) {
  const {
    dataSource,
    filter,
    objectType,
    requestedFields
  } = props;
  const CLICommand = generateCLICommand(
    dataSource.getDataSourceInstanceId(),
    filter,
    objectType,
    requestedFields
  )

  return (
    <>
      <div className="tol-code-block">
        <CodeBlock
          text={CLICommand}
          language="bash"
          showLineNumbers={false}
        />
      </div>
      <br />
      <Button
        onClick={() => copyToClipboard(CLICommand.trim())}
        icon="copy"
        text="Copy to Clipboard"
      />
      <br />
      <SdkInstructions/>
    </>
  );
}
