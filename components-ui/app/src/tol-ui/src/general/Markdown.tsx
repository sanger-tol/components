/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactMarkdown from "react-markdown";


export interface PMarkdown {
  contents: string;
}

export function Markdown(props: PMarkdown) {
  const { contents } = props;

  return (
    // @ts-ignore
    <ReactMarkdown>
      {contents}
    </ReactMarkdown>
  );
}
