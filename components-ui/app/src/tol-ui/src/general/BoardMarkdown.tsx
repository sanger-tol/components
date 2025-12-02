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
  PButton,
  saveTitle,
  updateConfigAndUpsert,
  useBoardPrivilege,
  PRIVILEGE,
  IMarkdownConfig,
  PVisualisation
} from "..";


export interface PBoardMarkdown extends PVisualisation {
  config: IMarkdownConfig;
}

export function BoardMarkdown(props: PBoardMarkdown) {
  const { id, utilityBarConfig, config, size, boardObjectType, boardDataSource, zone } = props;

  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdownViewer, setShowMarkdownViewer] = useState<boolean>(false);
  const { privilege } = useBoardPrivilege();


  useEffect(() => {
    (config.content || !(privilege === PRIVILEGE.BOARD.EDITABLE)) && setShowMarkdownViewer(true);
  }, []);

  const onMarkdownSave = (config: IMarkdownConfig) => {
    if (!showMarkdownViewer) {
      updateConfigAndUpsert(
        id,
        config,
        zone,
        boardDataSource
      )
    }
  }

  const previewButton: PButton = {
    position: "right",
    type: "primary",
    testid: "preview-markdown",
    icon: showPreview ? "eye-slash" : "eye",
    onClick: () => setShowPreview(!showPreview),
    visible: !showMarkdownViewer && privilege === PRIVILEGE.BOARD.EDITABLE,
    outline: true,
  }

  const editButton: PButton = {
    position: "right",
    type: "primary",
    testid: showMarkdownViewer ? "edit-markdown" : "save-markdown",
    tooltip: showMarkdownViewer ? "Edit" : "Save",
    icon: showMarkdownViewer ? "edit" : "save",
    onClick: () => {
      setShowMarkdownViewer(!showMarkdownViewer);
      onMarkdownSave({ content: content });
    },
    outline: true,
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  }

  const MdUtilityBar = (
    <UtilityBar
      id="editor-markdown"
      {...utilityBarConfig}
      buttons={[editButton, previewButton]}
      title={{
        text: utilityBarConfig.title?.text,
        editable: privilege === PRIVILEGE.BOARD.EDITABLE,
        onSave: (value: string) => {
          saveTitle(value, id, boardObjectType, boardDataSource);
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
    <div className="tol-markdown-viewer">
      <Markdown contents={content} />
    </div>
  );

  return (
    <>
      {MdUtilityBar}
      <div className="tol-component-contents-with-offset tol-markdown">
        {(showMarkdownViewer) ? MarkdownViewer : MarkdownEditor}
      </div>
    </>
  );
}
