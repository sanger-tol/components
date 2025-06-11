import Markdown from "./Markdown";
import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect } from "react";
import { IButton } from "../general/Button";
import { UtilityBar, TsDataSource } from "../index";
import { saveTitle, upsertComponentConfig } from "../boards/utils";

export interface Props {
  config: any;
  id: string;
  size: string;
  title: string;
}

export default function BoardMarkDown(props: Props) {
  const { config, id, size, title } = props;
  const [content, setContent] = useState<string>(config.content || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  // const conditionMarkdown = showMarkdown ? "Edit" : "Save";
  const conditionPreview = showPreview ? "Hide Preview" : "Show Preview";
  const ds = new TsDataSource();
  const resolution = { sm: "90px", md: "405px", lg: "565px" };

  useEffect(() => {
    config.content && setShowMarkdown(true);
    console.log(size);
  }, []);

  const onMarkdownSave = (config) => {
    {
      showMarkdown === false && upsertComponentConfig(ds, id, { ...config });
    }
  };

  const PreviewButton: IButton = {
    position: "right",
    type: "primary",
    text: conditionPreview,
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
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <UtilityBar
        id="editorMarkDown"
        buttons={[EditButton, showMarkdown ? undefined : PreviewButton]}
        title={{
          title: title,
          editable: true,
          onSave: (value: string) => {
            saveTitle(value, ds, id, "component");
          },
        }}
      />
      {showMarkdown ? (
        <div
          style={{
            border: "1px solid var(--tol-grey-subtle)",
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "var(--tol-grey-translucent)",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.6",
            height: resolution[size],
            boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}
        >
          <Markdown contents={content} />
        </div>
      ) : (
        <MDEditor
          value={content}
          onChange={setContent}
          preview={showPreview ? "live" : "edit"}
          height={resolution[size]}
        />
      )}
    </div>
  );
}
