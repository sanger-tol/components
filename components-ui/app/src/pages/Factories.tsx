/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createTextGeneratorFactory, Widgets } from "../tol-ui/src";
import { CodeBlock } from "react-code-blocks";
import { truncateString } from "../tol-ui/src/general/utils";

function Factories() {
  const words = createTextGeneratorFactory();
  const fiveWords = words.generateWords(5);
  const twoSentences = words.generateSentences(2);
  const oneParagraph = words.generateParagraphs(1);

  const fizzBuzzFooBarFactory = createTextGeneratorFactory({
    paragraphLowerBound: 2,
    paragraphUpperBound: 4,
    sentenceLowerBound: 2,
    sentenceUpperBound: 4,
    words: ["fizz", "buzz", "hullabaloo", "foo", "bar"],
  });
  const fizzBuzzFooBar = fizzBuzzFooBarFactory.generateParagraphs(1);

  const createFactory = "const words = createTextGeneratorFactory();\n";

  const codeBlock =
    "const fiveWords = words.generateWords(5);\n" +
    `// ${fiveWords}\n\n` +
    "const twoSentences = words.generateSentences(2);\n" +
    `// ${twoSentences}\n\n` +
    "const oneParagraph = words.generateParagraphs(1);\n" +
    `// ${truncateString(oneParagraph, 200)}\n`;

  const addOptions =
    "const words = createTextGeneratorFactory({\n" +
    "  paragraphLowerBound: 2, // minimum number of sentences in a paragraph\n" +
    "  paragraphUpperBound: 4, // maximum number of sentences in a paragraph\n" +
    "  sentenceLowerBound: 2, // minimum number of words in a sentence\n" +
    "  sentenceUpperBound: 4, // maximum number of words in a sentence\n" +
    "  words: ['fizz', 'buzz', 'hullabaloo', 'foo', 'bar'], // words to use instead of fake Latin\n" +
    "});\n\n" +
    "const fizzBuzzFooBar = words.generateParagraph(2);\n" +
    `// ${truncateString(fizzBuzzFooBar, 200)}\n`;

  const docsTitle = <h2>Factories</h2>;

  const content = (
    <>
      <div>
        <h3>Text Generator Factory</h3>
        <p>Generate words, sentences or paragraphs to add to add components.</p>
        <p style={{ marginBottom: "20px" }}>
          This is useful for generating random text to fill out components when
          developing, especially useful for testing larger amounts of text on
          smaller screens.
        </p>
      </div>
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
        <h5 style={{ margin: "5px 0px" }}>Add options to the factory:</h5>
        <div className="tol-download-modal-code">
          <CodeBlock
            text={addOptions}
            language="javascript"
            showLineNumbers={false}
          />
        </div>
      </div>
    </>
  );

  const components = [
    {
      component: docsTitle,
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
