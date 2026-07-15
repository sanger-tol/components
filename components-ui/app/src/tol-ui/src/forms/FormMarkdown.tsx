/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { FormComponentWrapper, IMarkdownField } from "..";

export interface PFormMarkdown
  extends Omit<IMarkdownField, "type" | "name"> {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
}

export function FormMarkdown(props: PFormMarkdown) {
  const {
    name,
    value,
    onChange,
    preview = true,
    label,
    removeCommands,
    height,
  } = props;

  return (
    <FormComponentWrapper {...props} id={name} label={label || "Markdown Editor:"}>
      <MDEditor
        id={label}
        value={value}
        onChange={(value) => onChange(value ?? "")}
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
    </FormComponentWrapper>
  );
}
