/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ITextEditorButtons, PButton } from "..";
import type { TTextEditorButton } from "..";

export const BUTTONS: Record<string, PButton> = {
  ADD: {
    type: "success",
    icon: "add",
    tooltip: "Add",
    disabledTooltip: "No changes to add",
    position: "right",
  },
  BACK: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Back",
  },
  CANCEL: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Cancel",
    position: "right",
  },
  REMOVE: {
    outline: true,
    type: "error",
    icon: "minus",
    tooltip: "Remove",
    position: "right",
  },
  CLOSE: {
    type: "error",
    icon: "xmark",
    tooltip: "Close",
    position: "right",
  },
  CONFIRM: {
    type: "success",
    icon: "check",
    tooltip: "Confirm",
    disabledTooltip: "No changes to confirm",
    position: "right",
  },
  DISCARD: {
    type: "error",
    icon: "trash",
    tooltip: "Discard Changes",
    disabledTooltip: "No changes to discard",
    position: "right",
  },
  DOWNLOAD: {
    outline: true,
    type: "primary",
    icon: "download",
    tooltip: "Download",
    disabledTooltip: "Download unavailable",
    position: "right",
  },
  EDIT: {
    type: "warning",
    icon: "pen-to-square",
    tooltip: "Edit",
    position: "right",
  },
  OK: {
    text: "OK",
    position: "right",
  },
  RETURN: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Return",
  },
  SAVE: {
    type: "success",
    icon: "save",
    tooltip: "Save Changes",
    disabledTooltip: "No changes to save",
    position: "right",
  },
  SHARE: {
    outline: true,
    type: "primary",
    icon: "share-from-square",
    tooltip: "Share",
    position: "right",
  },
  NEXT: {
    outline: true,
    type: "primary",
    text: "Next",
    icon: "arrow-right",
    tooltip: "Next",
    position: "right",
  },
  PREVIOUS: {
    outline: true,
    type: "primary",
    text: "Back",
    icon: "arrow-left",
    tooltip: "Previous",
    position: "left",
  },
  SETTINGS: {
    outline: true,
    type: "primary",
    icon: "gear",
    text: "Settings",
    tooltip: "Settings",
    position: "right",
  },
  TRANSLATORS: {
    outline: true,
    type: "primary",
    icon: "diagram-predecessor",
    tooltip: "Translate filters from one Zone to another",
    position: "right",
  },
  COPY: {
    outline: true,
    type: "primary",
    icon: "copy",
    tooltip: "Copy",
    position: "right",
  },
  PASTE: {
    outline: true,
    type: "primary",
    icon: "paste",
    tooltip: "Paste",
    position: "right",
  },
  INITIATE_TOUR: {
    outline: true,
    icon: "question",
    tooltip: "Take the tour",
    position: "right",
  }
};

export const TEXT_EDITOR_BUTTONS = ({
  editor,
  editorState,
}: ITextEditorButtons): Record<Uppercase<TTextEditorButton>, PButton> => {
  if (!editor) {
    return {} as Record<Uppercase<TTextEditorButton>, PButton>;
  }

  return {
    BOLD: {
      onClick: () => editor.chain().focus().toggleBold().run(),
      disabled: !editorState.canBold,
      disabledTooltip: "Cannot toggle bold here",
      tooltip: "Bold",
      icon: "bold",
      outline: !editorState.isBold,
    },
    ITALIC: {
      onClick: () => editor.chain().focus().toggleItalic().run(),
      disabled: !editorState.canItalic,
      disabledTooltip: "Cannot toggle italic here",
      tooltip: "Italic",
      icon: "italic",
      outline: !editorState.isItalic,
    },
    UNDERLINE: {
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      disabled: !editorState.canUnderline,
      disabledTooltip: "Cannot toggle underline here",
      tooltip: "Underline",
      icon: "underline",
      outline: !editorState.isUnderline,
    },
    STRIKE: {
      onClick: () => editor.chain().focus().toggleStrike().run(),
      disabled: !editorState.canStrike,
      disabledTooltip: "Cannot toggle strikethrough here",
      tooltip: "Strikethrough",
      icon: "strikethrough",
      outline: !editorState.isStrike,
    },
    BULLET_LIST: {
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      disabled: !editorState.canBulletList,
      disabledTooltip: "Cannot toggle bullet list here",
      tooltip: "Bullet List",
      icon: "list-ul",
      outline: !editorState.isBulletList,
    },
    ORDERED_LIST: {
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      disabled: !editorState.canOrderedList,
      disabledTooltip: "Cannot toggle ordered list here",
      tooltip: "Ordered List",
      icon: "list-ol",
      outline: !editorState.isOrderedList,
    },
    HEADING_1: {
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      disabled: !editorState.canHeading1,
      disabledTooltip: "Cannot set heading here",
      tooltip: "Heading 1",
      text: "H1",
      outline: !editorState.isHeading1,
    },
    HEADING_2: {
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      disabled: !editorState.canHeading2,
      disabledTooltip: "Cannot set heading here",
      tooltip: "Heading 2",
      text: "H2",
      outline: !editorState.isHeading2,
    },
    HEADING_3: {
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      disabled: !editorState.canHeading3,
      disabledTooltip: "Cannot set heading here",
      tooltip: "Heading 3",
      text: "H3",
      outline: !editorState.isHeading3,
    },
    HEADING_4: {
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
      disabled: !editorState.canHeading4,
      disabledTooltip: "Cannot set heading here",
      tooltip: "Heading 4",
      text: "H4",
      outline: !editorState.isHeading4,
    },
    PARAGRAPH: {
      onClick: () => editor.chain().focus().setParagraph().run(),
      disabled: !editorState.canParagraph,
      disabledTooltip: "Cannot set paragraph here",
      tooltip: "Paragraph",
      icon: "paragraph",
      outline: !editorState.isParagraph,
    },
    BLOCK_QUOTE: {
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      disabled: !editorState.canBlockquote,
      disabledTooltip: "Cannot toggle blockquote here",
      tooltip: "Blockquote",
      icon: "quote-left",
      outline: !editorState.isBlockquote,
    },
    CODE_BLOCK: {
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      disabled: !editorState.canCodeBlock,
      disabledTooltip: "Cannot toggle code block here",
      tooltip: "Code Block",
      icon: "file-code",
      outline: !editorState.isCodeBlock,
    },
    CODE: {
      onClick: () => editor.chain().focus().toggleCode().run(),
      disabled: !editorState.canCode,
      disabledTooltip: "Cannot toggle inline code here",
      tooltip: "Inline Code",
      icon: "code",
      outline: !editorState.isCode,
    },
    LINK: {
      onClick: () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previousUrl);
        if (url === null) {
          return;
        }
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return;
        }
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      },
      disabled: !editorState.canLink,
      disabledTooltip: "Cannot add a link here",
      tooltip: "Link",
      icon: "link",
      outline: !editorState.isLink,
    },
    UNDO: {
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editorState.canUndo,
      disabledTooltip: "Nothing to undo",
      tooltip: "Undo",
      icon: "undo",
    },
    REDO: {
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editorState.canRedo,
      disabledTooltip: "Nothing to redo",
      tooltip: "Redo",
      icon: "redo",
    },
    HIGHLIGHT: {
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      disabled: !editorState.canHighlight,
      disabledTooltip: "Cannot highlight here",
      tooltip: "Highlight",
      icon: "highlighter",
      outline: !editorState.isHighlight,
    },
    SUPER_SCRIPT: {
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
      disabled: !editorState.canSuperscript,
      disabledTooltip: "Cannot toggle superscript here",
      tooltip: "Superscript",
      icon: "superscript",
      outline: !editorState.isSuperscript,
    },
    SUB_SCRIPT: {
      onClick: () => editor.chain().focus().toggleSubscript().run(),
      disabled: !editorState.canSubscript,
      disabledTooltip: "Cannot toggle subscript here",
      tooltip: "Subscript",
      icon: "subscript",
      outline: !editorState.isSubscript,
    },
    ALIGN_LEFT: {
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      disabled: !editorState.canAlignLeft,
      disabledTooltip: "Cannot align here",
      tooltip: "Align Left",
      icon: "align-left",
      outline: !editorState.isAlignLeft,
    },
    ALIGN_CENTER: {
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      disabled: !editorState.canAlignCenter,
      disabledTooltip: "Cannot align here",
      tooltip: "Align Center",
      icon: "align-center",
      outline: !editorState.isAlignCenter,
    },
    ALIGN_RIGHT: {
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      disabled: !editorState.canAlignRight,
      disabledTooltip: "Cannot align here",
      tooltip: "Align Right",
      icon: "align-right",
      outline: !editorState.isAlignRight,
    },
    ALIGN_JUSTIFY: {
      onClick: () => editor.chain().focus().setTextAlign("justify").run(),
      disabled: !editorState.canAlignJustify,
      disabledTooltip: "Cannot align here",
      tooltip: "Justify",
      icon: "align-justify",
      outline: !editorState.isAlignJustify,
    },
  };
};
