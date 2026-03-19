/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CodeBlock } from "react-code-blocks";
import {
  Button,
  IFilter,
  copyToClipboard,
  generateCLICommand
} from "../..";
import { SdkInstructions } from ".";

export interface PCommandLineTab {
  source: string,
  filter: IFilter,
  objectType: string
  requestedFields: string[]
}

export function CommandLineTab(props: PCommandLineTab) {
  const {
    source,
    filter,
    objectType,
    requestedFields
  } = props;
  const sourceToUse = source || "portal";

  const CLICommand = generateCLICommand(sourceToUse, filter, objectType, requestedFields)

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
