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
    <div className="tol-component-contents with-overflow">
      {/* @ts-ignore */}
      <ReactMarkdown
        components={{
          h1: "h3",
          h2: "h4",
          h3: "h5",
          h4: "h6",
          h5: "h6",
          h6: "h6",
        }}
      >
        {contents}
      </ReactMarkdown>
    </div>
  );
}
