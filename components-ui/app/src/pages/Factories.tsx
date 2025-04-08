/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createTextGeneratorFactory, Widgets } from "../tol-ui/src";
import { CodeBlock } from "react-code-blocks";

function Factories() {
  const textFactoryTitle = <h3>Text Generator Factory</h3>;
  const words = createTextGeneratorFactory();

  const fiveWords = words.generateWords(5);
  const twoSentences = words.generateSentences(2);
  const oneParagraph = words.generateParagraphs(1);

  const createFactory = "const words = createTextGeneratorFactory();\n";
  const codeBlock =
    "const fiveWords = words.generateWords(5);\n" +
    `// ${fiveWords}\n\n` +
    "const twoSentences = words.generateSentences(2);\n" +
    `// ${twoSentences}\n\n` +
    "const oneParagraph = words.generateParagraphs(1);\n" +
    `// ${oneParagraph}\n\n`;

  const content = (
    <div>
      <h5 style={{ marginBottom: "5px" }}>Initialise factory:</h5>
      <div className="tol-download-modal-code">
        <CodeBlock
          text={createFactory}
          language="javascript"
          showLineNumbers={false}
        />
      </div>
      <h5 style={{ margin: "5px 0px" }}>
        Generate words, sentences, or paragraphs:
      </h5>
      <div className="tol-download-modal-code">
        <CodeBlock
          text={codeBlock}
          language="javascript"
          showLineNumbers={false}
        />
      </div>
    </div>
  );

  const components = [
    {
      component: textFactoryTitle,
      type: "full",
    },
    {
      component: content,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default Factories;
