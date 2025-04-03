import { LoremIpsum } from "lorem-ipsum";

export interface LoremIpsumGenerator {
  generateWords: (count?: number) => string;
  generateSentences: (count?: number) => string;
  generateParagraphs: (count?: number) => string;
}

function createLoremIpsumGenerator(options?: any): LoremIpsumGenerator {
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

export default createLoremIpsumGenerator;
