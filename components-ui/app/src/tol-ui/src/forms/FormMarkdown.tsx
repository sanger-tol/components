/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { RSForm } from "..";

export interface PFormMarkdown {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
  label?: string;
  removeCommands?: string[];
  height?: string | number;
}

export function FormMarkdown(props: PFormMarkdown) {
  const { value, onChange, preview, label, removeCommands, height } = props;

  return (
    <>
      {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
      <MDEditor
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
        commandsFilter={(commands) => {
          return !removeCommands?.includes(commands.name) ? commands : [];
        }}
      />
    </>
  );
}
