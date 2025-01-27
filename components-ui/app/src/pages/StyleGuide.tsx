/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets, Markdown } from "../tol-ui/src";

function StyleGuide() {
  const title = (
    <>
      <h1>Developer Style Guide</h1>
      <p>
        This is a developer style guide for TypeScript/JavaScript and React.
      </p>
    </>
  );

  const markdownContent = `
  # Heading 1
  ## Heading 2
  ### Heading 3
  Example of using a code block:
  \`\`\`typescript 
  // This is a TypeScript interface
  interface Props {
    content: string;
    onClick?: () => void;
  }
  \`\`\`
  `;

  const markdownContainer = (
    <div>
      <Markdown contents={markdownContent} />
    </div>
  );

  const components = [
    {
      component: title,
      type: "full",
    },
    {
      component: markdownContainer,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default StyleGuide;
