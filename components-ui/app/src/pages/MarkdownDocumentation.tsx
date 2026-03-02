/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Markdown, Widgets } from "../tol-ui/src";


export interface PMarkdownDocumentation {
  content: string;
}

export function MarkdownDocumentation(props: PMarkdownDocumentation) {
  const { content } = props;

  const components = [
    {
      component: <Markdown contents={content} />,
      type: "full",
    },
  ];

  return (
    <Widgets components={components} />
  );
}

