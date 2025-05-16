/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { LoremIpsum } from "lorem-ipsum";

export interface TextGeneratorFactory {
  generateWords: (count?: number) => string;
  generateSentences: (count?: number) => string;
  generateParagraphs: (count?: number) => string;
}

export function createTextGeneratorFactory(options?: any): TextGeneratorFactory {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4,
    },
    wordsPerSentence: {
      max: 16,
      min: 4,
    },
    ...options,
  });

  return {
    generateWords: (count = 3) => lorem.generateWords(count),
    generateSentences: (count = 1) => lorem.generateSentences(count),
    generateParagraphs: (count = 1) => lorem.generateParagraphs(count),
  };
}
