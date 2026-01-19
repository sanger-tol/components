/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Markdown, Widgets, CenterContent } from "../tol-ui/src";


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
    <div className="code-style">
      <CenterContent>
        <Widgets components={components} />
      </CenterContent>
    </div>
  );
}

