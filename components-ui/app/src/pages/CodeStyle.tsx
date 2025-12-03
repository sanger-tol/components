/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Markdown, Widgets, CenterContent } from "../tol-ui/src";
import styleGuideContent from "../docs/style-guide.md?raw";

export function CodeStyle() {
  const components = [
    {
      component: <Markdown contents={styleGuideContent} />,
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

