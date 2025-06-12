/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import Markdown from "./Markdown";
import MDEditor from "@uiw/react-md-editor";
import { IButton } from "../general/Button";
import { UtilityBar, TsDataSource } from "../index";
import { saveTitle, upsertComponentConfig } from "../boards/utils";
import { BoardObjectTypes } from "../constants";

export interface MdComponentConfig {
  content: string;
}

interface Props {
  config: MdComponentConfig;
  id: string;
  size: string;
  title: string;
}

const RESOLUTION = { sm: "90px", md: "405px", lg: "565px" };

export default function BoardMarkDown(props: Props) {
  const { config, id, size, title } = props;
  const ds = new TsDataSource();

  const [flipped, setFlipped] = useState<boolean>(false);
  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);

  useEffect(() => {
    config.content && setShowMarkdown(true);
  }, []);

  const onMarkdownSave = (config: MdComponentConfig) => {
    {
      showMarkdown === false && upsertComponentConfig(ds, id, { ...config });
    }
  };

  const PreviewButton: IButton = {
    position: "right",
    type: "primary",
    icon: showPreview ? "eye-slash" : "eye",
    onClick: () => setShowPreview(!showPreview),
  };

  const EditButton: IButton = {
    position: "right",
    type: "primary",
    tooltip: showMarkdown ? "Edit" : "Save",
    icon: showMarkdown ? "edit" : "save",
    onClick: () => {
      setShowMarkdown(!showMarkdown);
      onMarkdownSave({ content: content });
      setFlipped(!flipped);
    },
  };

  const MdUtilityBar = (
    <UtilityBar
      id="editor-markdown"
      buttons={[EditButton, !showMarkdown ? PreviewButton : undefined]}
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
    <div className="front">
      <MDEditor
        value={content}
        onChange={setContent}
        preview={showPreview ? "live" : "edit"}
        height={RESOLUTION[size]}
      />
    </div>
  );

  const MarkdownViewer = (
    <div className="back">
      <div className={`tol-rich-text-viewer-inner-container ${size}`}>
        <Markdown contents={content} />
      </div>
    </div>
  );

  return (
    <div>
      {MdUtilityBar}
      <div className="tol-rich-text-flip-container">
        <div
          className={`tol-rich-text-flipper ${showMarkdown ? "flipped" : ""}`}
        >
          {MarkdownEditor}
          {MarkdownViewer}
        </div>
      </div>
    </div>
  );
}
