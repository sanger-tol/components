/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import Markdown from "./Markdown";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { IButton } from "./Button";
import { UtilityBar, TsDataSource } from "../index";
import { saveTitle, upsertComponentConfig } from "../boards/utils";
import { BoardObjectTypes } from "../constants";


export interface IMarkdownConfig {
  content: string;
}

interface Props {
  config: IMarkdownConfig;
  id: string;
  size: string;
  title: string;
}

// const RESOLUTION = { sm: "90px", md: "300px", lg: "565px" };

function BoardMarkdown(props: Props) {
  const { config, id, size, title } = props;
  const ds = new TsDataSource();

  const [flipped, setFlipped] = useState<boolean>(false);
  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdownViewer, setShowMarkdownViewer] = useState<boolean>(false);


  useEffect(() => {
    config.content && setShowMarkdownViewer(true);
  }, []);

  const onMarkdownSave = (config: IMarkdownConfig) => {
    if (!showMarkdownViewer) {
      upsertComponentConfig(ds, id, { ...config });
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
      setFlipped(!flipped);
    },
  }

  const MdUtilityBar = (
    <UtilityBar
      id="editor-markdown"
      buttons={[EditButton, PreviewButton]}
      title={{
        title: title,
        editable: true,
        onSave: (value: string) => {
          saveTitle(value, ds, id, BoardObjectTypes.COMPONENT);
        },
      }}
    />
  );

  const MarkdownEditor = (
    <>
      <span className="tol-hide-extra-viewer-buttons" />
      <MDEditor
        value={content}
        onChange={(content?: string) => setContent(content ?? "")}
        preview={showPreview ? "live" : "edit"}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        hideToolbar={size === 'sm'}
        className = 'tol-markdown-viewer'
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

export default BoardMarkdown;
