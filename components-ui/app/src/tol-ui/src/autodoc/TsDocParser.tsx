/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IComponentDocumentation, 
  IComponentExample, 
  IComponentProp
 } from "..";

/**
 * Error thrown by methods of {@link TsDocParser}
 */
export class TsDocParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TsDocParseError";
    Object.setPrototypeOf(this, TsDocParseError.prototype);
  }
}

/**
 * Parses TSDoc comments tagged with autodoc to extract component documentation.
 * From the provided file contents, it extracts the autodoc comment as well as the interface,
 * which are then passed to extraction functions that use regular expressions to get the specific information needed
 */
export class TsDocParser {
  /**
   * Entry-point to the parser.
   * @param fileContent The string contents of the file containing the component to document
   * @param filePath The relative path of the file containing the component to document
   * @returns Component documentation for this file, or `null` if no autodoc tag found
   */
  public static parseFileContent(fileContent: string, filePath: string): IComponentDocumentation | null {
    // Use a RegEx pattern on the whole file contents to see whether auto-documentation is being used.
    // This searches for the whole TSDoc block comment, containing "@autodoc"
    const autodocMatch = fileContent.match(/\/\*\*[\s\S]*?@autodoc[\s\S]*?\*\//g);
    if (!autodocMatch) return null;

    // Extract the documentation information contained in the autodoc comment
    const autodocComment = autodocMatch[0];
    const { description, examples, remarks } = this.extractFromAutodocComment(autodocComment);

    // Derive the name of the component to be documented from its file path
    const componentName = this.extractComponentName(filePath);

    // Crawl through interfaces to finalize documentation for every immediate and inherited prop
    const propDocumentation = this.parsePropDocumentation(fileContent, componentName);

    // Construct and return final documentation object
    return {
      name: componentName,
      filePath,
      description,
      props: propDocumentation,
      examples,
      remarks,
    };
  }

  /**
   * Extracts the name of the component to be documented from the path of the file containing the component
   */
  private static extractComponentName(filePath: string): string {
    // Use a regular expression to extract the file name (without extension) from the file path.
    // The component name should be the same as the file name
    const componentNameMatch = filePath.match(/[^\\/]+(?=\.tsx$)/);

    if (componentNameMatch) {
      return componentNameMatch[0];
    } else {
      throw new TsDocParseError(
        `Unable to extract the component name from file path '${filePath}'`
      )
    }
  }

  /**
   * Extracts the component description, example usages, and further remarks from the autodoc comment.
   * This is done by using a regular expression for each piece of information to be extracted
   */
  private static extractFromAutodocComment(autodocComment: string): {
    description?: string,
    examples: IComponentExample[],
    remarks?: string[]
  } {
    function extract(autodocComment: string, regex: RegExp): string[] | undefined {
      // Perform search
      const matches = autodocComment.match(regex);
      if (!matches) return;

      // Sanitise TSDoc artefacts out of results
      return matches.map(match => match
        .replace(/\s*\*\s?/g, " ")
        .trim()
        .replace(/\s+/g, " ")
      );
    }

    // The description is the text after @autodoc but before @props start
    const description = extract(autodocComment, /(?<=@autodoc\s*\*\s*)([\s\S]*?)(?=\s*\*\s*@prop)/);

    // The remarks begin with @remarks,
    // TODO

    return {
      description,
      examples: []
    };
  }

  private static parsePropDocumentation(fileContent: string, componentName: string): IComponentProp[] {
    // Search for the interface block (from "interface" to the final "}"). Checks specifically for `P{componentName}`
    // const propsInterfaceRegex = new RegExp(`interface\\s+P${componentName}[^{]*\\{([^}]+)\\}`, "s");
    // const propsInterfaceMatch = fileContent.match(propsInterfaceRegex);
    // if (!propsInterfaceMatch) {
    //   throw new TsDocParseError(`Unable to find the props interface definition (P${componentName})`);
    // }
  }
}
