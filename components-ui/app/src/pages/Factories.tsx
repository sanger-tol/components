/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { loremIpsumGenerator } from "../tol-ui/src";

function Factories() {
  const lorem = loremIpsumGenerator();
  const words = lorem.generateWords(5);
  const sentences = lorem.generateSentences(2);
  const paragraphs = lorem.generateParagraphs(1);

  console.log("Words:", words);
  console.log("Sentences:", sentences);
  console.log("Paragraphs:", paragraphs);
  return <></>;
}

export default Factories;
