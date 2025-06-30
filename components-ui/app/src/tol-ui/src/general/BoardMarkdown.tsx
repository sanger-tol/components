/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import {
  Markdown,
  UtilityBar,
  IBoardTargetAndZone,
  IButton,
  saveTitle,
  upsertComponentConfig,
} from "..";


export interface IMarkdownConfig {
  content: string;
}

export interface IBoardMarkdown extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: IMarkdownConfig;
  size: string;
}

export function BoardMarkdown(props: IBoardMarkdown) {
  const { id, title, config, size, boardObjectType, boardDataSource } = props;

  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdownViewer, setShowMarkdownViewer] = useState<boolean>(false);


  useEffect(() => {
    config.content && setShowMarkdownViewer(true);
  }, []);

  const onMarkdownSave = (config: IMarkdownConfig) => {
    if (!showMarkdownViewer) {
      upsertComponentConfig(boardDataSource, id, { ...config });
    }
  }

  const PreviewButton: IButton = {
    position: "right",
    type: "primary",
    icon: showPreview ? "eye-slash" : "eye",
    onClick: () => setShowPreview(!showPreview),
    visible: !showMarkdownViewer,
  }

  const EditButton: IButton = {
    position: "right",
    type: "primary",
    tooltip: showMarkdownViewer ? "Edit" : "Save",
    icon: showMarkdownViewer ? "edit" : "save",
    onClick: () => {
      setShowMarkdownViewer(!showMarkdownViewer);
      onMarkdownSave({ content: content });
    },
  }

  const MdUtilityBar = (
    <UtilityBar
      id="editor-markdown"
      buttons={[EditButton, PreviewButton]}
      title={{
        text: title,
        editable: true,
        onSave: (value: string) => {
          saveTitle(value, boardDataSource, id, boardObjectType);
        },
      }}
    />
  );

  const MarkdownEditor = (
    <>
      <span className={size !== "sm" ? "tol-hide-extra-viewer-buttons" : ""} />
      <MDEditor
        value={content}
        onChange={(content?: string) => setContent(content ?? "")}
        preview={showPreview ? "live" : "edit"}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        hideToolbar={size === "sm"}
        className="tol-markdown-viewer"
        height="100%"
      />
    </>
  );

  const MarkdownViewer = (
    <Markdown contents={content} />
  );

  return (
    <>
      {MdUtilityBar}
      <div className="tol-component-contents tol-markdown">
        {showMarkdownViewer ? MarkdownViewer : MarkdownEditor}
      </div>
    </>
  );
}
