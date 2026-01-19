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

    // Extract information from the file.
    // These strings, along with the parameters to this metho, will be the strings handled by the extraction functions below,
    // which extract the information we need to construct the final documentation object
    const autodocComment = autodocMatch[0];
    const propsInterface = "";  // TODO

    // Construct and return final documentation object
    return {
      name: this.extractComponentName(filePath),
      filePath,
      description: this.extractComponentDescription(autodocComment),
      props: this.extractPropsDocumentation(autodocComment, propsInterface),
      examples: this.extractExamplesDocumentation(autodocComment),
      remarks: this.extractComponentRemarks(autodocComment),
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
   * Extracts the description of the component to be documented from the autodoc comment
   */
  private static extractComponentDescription(autodocComment: string): string | undefined {
    // TODO
    return undefined;
  }

  private static extractPropsDocumentation(
    autodocComment: string, propsInterface: string
  ): IComponentProp[] {
    // TODO
    return [];
  }

  private static extractExamplesDocumentation(autodocComment: string): IComponentExample[] {
    // TODO
    return [];
  }

  private static extractComponentRemarks(autodocComment: string): string[] | undefined {
    // TODO
    return undefined;
  }
}
