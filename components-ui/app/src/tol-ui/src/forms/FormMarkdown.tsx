/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { FormLabel, IFormLabelIcon, RSForm } from "..";

export interface PFormMarkdown {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
  label?: string;
  removeCommands?: string[];
  height?: string | number;
  helpText?: string;
  errorText?: string;
  icon?: IFormLabelIcon;
}

export function FormMarkdown(props: PFormMarkdown) {
  const {
    value,
    onChange,
    preview = true,
    label,
    removeCommands,
    height,
    helpText,
    errorText,
    icon
  } = props;

  return (
    <>
      <RSForm.Group controlId={label}>
        <FormLabel label={label || "Markdown Editor:"} icon={icon}/>
        {helpText && (
          <div className="tol-form-markdown-help-text">
            <RSForm.HelpText>{helpText}</RSForm.HelpText>
          </div>
        )}
        <MDEditor
          id={label}
          value={value}
          onChange={onChange}
          preview={preview ? "live" : "edit"}
          className="tol-markdown-viewer tol-form-markdown"
          fullscreen={false}
          height={height || "100%"}
          visibleDragbar={false}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          commandsFilter={(commands: any) => {
            return !removeCommands?.includes(commands.name) ? commands : [];
          }}
        />
        <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">{errorText}</RSForm.ErrorMessage>
      </RSForm.Group>
    </>
  );
}
