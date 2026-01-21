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
    /**
     * Extracts the text under a paricular tag in the autodoc comment.
     * Works only for tags whose text is under them
     * @param autodocComment The whole autodoc comment text
     * @param tag The TSDoc tag in the form of an @ followed by a tag name
     * @returns The text found under the tag
     */
    function extractTag(autodocComment: string, tag: string): string[] {
      // Perform search
      // TODO Address ReDoS
      const regex = new RegExp(`(?<=@${tag}\\s*\\*\\s*)([\\s\\S]*?)(?=\\s*\\*?\\s*@|\s*\\*\\/)`);
      const matches = autodocComment.match(regex);
      if (!matches) return [];

      // Sanitise TSDoc artefacts out of results
      return matches.map(match => match
        .replace(/\s*\*\s?/g, " ")
        .trim()
        .replace(/\s+/g, " ")
      );
    }

    // The description is the text after @autodoc
    const description = extractTag(autodocComment, "autodoc")[0] || undefined;

    // TODO: This only parses code for examples. Allow for titles too
    const examples: IComponentExample[] = extractTag(autodocComment, "example").map(exampleCode => ({
      code: exampleCode
    }));

    const remarks = extractTag(autodocComment, "remarks");

    return {
      description,
      examples,
      remarks,
    };
  }

  /**
   * Helper method for parsePropDocumentation.
   * Uses regex extract an interface from a file contents string
   * @param fileContents 
   * @param interfaceName 
   * @returns The whole block of the interface with this name
   */
  private static extractInterfaceFromFile(fileContents: string, interfaceName: string): string {
    // Make the interface name safe to use in regex
    const escapedInterfaceName = interfaceName.replace(/[-/\\^$.*+?()[\]{}|]/g, "\\$&");

    // Run regex pattern
    const regex = new RegExp(`interface\\s+${escapedInterfaceName}\\s*{[^}]*}`, "g");
    const matches = fileContents.match(regex);
    
    // Return the match if there was one
    if (matches) {
      return matches[0];
    } else {
      throw new TsDocParseError(`Unable to find the interface ${interfaceName}`);
    }
  }

  /**
   * Helper method for parsePropDocumentation.
   * Extracts prop information from an interface into `IComponentProp`s
   * @param interfaceText The block of text where the interface is defined. The information to extract is in here
   * @returns An array of all of the props defined in *this* interface
   */
  private static extractPropsFromInterface(interfaceText: string): IComponentProp[] {
    // Set up the regex patterns we'll be using
    const propDocCommentRegex = /\*\*([\s\S]*?)\*\//g;
    const propDefinitionRegex = /(\w+:\s*[\w<>,\s|]+)(?=\s*(;|\n))/g;
    
    // Loop through all lines in the interface.
    // If the line is a doc comment, store it, because the next match will be the prop
    // that this comment is describing.
    // Once we get to said line, we can use the gathered information to form an IComponentProp.
    // We then reset ready to do it again. This is done until the interface is complete
    const props: IComponentProp[] = [];
    let currentDocComment: string | undefined;
    for (const line of interfaceText.split("\n")) {
      // Check for doc comment
      const docCommentMatch = propDocCommentRegex.exec(line);
      if (docCommentMatch) {
        currentDocComment = docCommentMatch[1].trim();  // Store the last found comment
      }

      // Check for prop definition
      const propDefinitionMatch = propDefinitionRegex.exec(line);
      if (propDefinitionMatch) {
        // TODO: There may still be an issue here if the type is a lambda
        // Split by the colon to get the name and type
        const [propName, propType] = propDefinitionMatch[0].split(":").map(s => s.trim());

        // Construct an IComponentProp
        props.push({
          name: propName,
          type: propType,
          required: !propType.includes("?"),
          description: currentDocComment,
          // TODO: Handle default value
        });
      }
    }

    return props;
  }

  private static parsePropDocumentation(fileContent: string, componentName: string): IComponentProp[] {    
    // Search for the interface block (from "interface" to the final "}").
    // Checks specifically for `P{componentName}` in the original file
    const propsInterfaceRegex = new RegExp(`interface\\s+P${componentName}[^{]*\\{([^}]+)\\}`, "s");
    const propsInterfaceMatch = fileContent.match(propsInterfaceRegex);
    if (!propsInterfaceMatch) {
      throw new TsDocParseError(`Unable to find the props interface definition (P${componentName})`);
    }

    // We have an array of propsDocumentation, which gets amended to with the documentation for
    // the current interface each iteration. Each iteration is a "deeper" interface, starting
    // with the main props interface "P{COMPONENT NAME}" then following the chain of interfaces it extends from
    // TODO: There's likely a cleaner way to do this
    let currentInterface = propsInterfaceMatch[0];
    let propsDocumentation: IComponentProp[] = [];
    do {
      // Add the documentation for the props in the current interface to the list
      propsDocumentation = propsDocumentation.concat(this.extractPropsFromInterface(currentInterface));

      // Check whether there's a deeper interface. If there is, get its name
      const deeperInterfaceMatch = currentInterface.match(/extends\s+([a-zA-Z_][a-zA-Z0-9_]*)/);

      // If there is not a deeper interface, we're done
      if (!deeperInterfaceMatch) return propsDocumentation;

      // Else there is a deeper interface to explore
      currentInterface = deeperInterfaceMatch[0];
      
      // TODO NEXT TIME: Store the current file, then get the path here, open it, extract the interface, then continue
      // Then/right now refactor to not use do-while because it's not the easiest to follow
    } while (true);
  }
}
