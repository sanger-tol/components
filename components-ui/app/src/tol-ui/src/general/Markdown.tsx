/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactMarkdown from "react-markdown";

interface Props {
  contents: string;
}

export function Markdown(props: Props) {
  const { contents } = props;

  return (
    <ReactMarkdown className="tol-markdown">
      {contents}
    </ReactMarkdown>
  );
}
