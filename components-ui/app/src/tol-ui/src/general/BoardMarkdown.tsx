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
  updateComponentConfigAndUpsert,
  useBoard,
  IMarkdownConfig,
  PVisualisationComponent,
  mergeUtilityBarConfigs
} from "..";


/** Props for the BoardMarkdown component. */
export interface PBoardMarkdown extends PVisualisationComponent<IMarkdownConfig> {}

/** Component for displaying and editing markdown content on the board. */
export function BoardMarkdown(props: PBoardMarkdown) {
  const { id, utilityBarConfig, config, setConfig, size, boardDataSource, zone } = props;

  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdownViewer, setShowMarkdownViewer] = useState<boolean>(false);
  const { editMode } = useBoard();


  useEffect(() => {
    (config.content || !(editMode)) && setShowMarkdownViewer(true);
  }, []);

  useEffect(() => {
    setContent(config.content || "");
  }, [config.content]);

  const onMarkdownSave = (config: IMarkdownConfig) => {
    if (!showMarkdownViewer) {
      setConfig(config);
      updateComponentConfigAndUpsert(
        id,
        config,
        zone,
        boardDataSource,
        editMode,
      )
    }
  }

  const previewButton: PButton = {
    position: "right",
    type: "primary",
    testid: "preview-markdown",
    icon: showPreview ? "eye-slash" : "eye",
    onClick: () => setShowPreview(!showPreview),
    visible: !showMarkdownViewer,
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
    visible: editMode,
  }

  const ubc = mergeUtilityBarConfigs(
    utilityBarConfig,
    {
      buttons: [
        previewButton,
        editButton
      ],
    }
  )

  const MarkdownEditor = (
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
  );

  const MarkdownViewer = (
    <Markdown contents={content} />
  );

  return (
    <div className="tol-component-contents" data-testid="board-component-text">
      <UtilityBar noLeftSide id={id} {...ubc} />
      <div className="tol-markdown tol-component-contents">
        {(showMarkdownViewer) ? MarkdownViewer : MarkdownEditor}
      </div>
    </div>
  );
}
