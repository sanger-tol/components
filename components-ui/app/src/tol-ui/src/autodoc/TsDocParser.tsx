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

// @ts-ignore - Use Vite's glob import to get all tsx/jsx files as raw strings
const modules = import.meta.glob("../**/*.{tsx,jsx,ts,js}", { 
  as: "raw",
  eager: true 
});

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
    // Check whether this file has an autodoc comment.
    // If it does, get the comment. If it does not, there is no parsing to do
    const autodocComment = this.extractAutodocCommentFromFileContent(fileContent);
    if (!autodocComment) return null;

    // Extract the documentation information contained in the autodoc comment
    const { description, examples, remarks } = this.extractFromAutodocComment(autodocComment);

    // Derive the name of the component to be documented from its file path
    const componentName = this.extractComponentName(filePath);

    // Crawl through interfaces to generate documentation for every immediate and inherited prop
    const propDocumentation = this.parsePropDocumentation(fileContent, "P" + componentName);

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
   * Extracts the autodoc comment from a file
   * @param fileContent The text contents of the file potentially containing the autodoc comment
   * @returns The autodoc comment as a string, or `null` if one was not found
   */
  private static extractAutodocCommentFromFileContent(fileContent: string): string | null {
    // Use a regular expression on the whole file contents to get all TSDoc comments
    const autodocMatch = fileContent.match(/\/\*\*\s*\n?([\s\S]*?\*\/)/g);
    if (!autodocMatch) return null;

    // We're not just looking at TSDoc comments, we're looking for autodoc comments,
    // which are TSDoc comments containing @autodoc
    const autodocComments = autodocMatch.filter(comment => /@autodoc/.test(comment));
    if (autodocComments.length < 1) return null;

    // Accept only the first match
    const autodocComment = autodocComments[0];

    return autodocComment;
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
   * Recursive method that extracts documentation about props from a specific interface in a file.
   * Starting with the props interface in the same file as the component, it crawls through deeper extended interfaces,
   * building up the full array of prop documentation
   * @param fileContent The content of the file to search on this call
   * @param interfaceName The name of the interface to extract prop documentation from
   */
  private static parsePropDocumentation(fileContent: string, interfaceName: string): IComponentProp[] {
    // Extract the interface from the file
    const interfaceText = this.extractInterfaceFromFile(fileContent, interfaceName);
    
    // Extract the documentation for the props in this interface
    const propDocs = this.extractPropsFromInterface(interfaceText, interfaceName);

    // Check if there's a deeper interface.
    // If there is, get its name. If there isn't, we're done
    const deeperInterfaceMatch = interfaceText.match(/(?:extends\s+)([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (!deeperInterfaceMatch) return propDocs;
    const deeperInterfaceName = deeperInterfaceMatch[1];

    // Now we know there's a deeper interface, get the contents of the file it's defined in
    const deeperInterfaceFileContents = this.getTheContentsOfTheFileAnInterfaceIsDefinedIn(deeperInterfaceName);
    if (!deeperInterfaceFileContents) {
      throw new TsDocParseError(`Unable to find a file containing the interface ${deeperInterfaceName}`);
    }

    // Resursively search this file too
    return propDocs.concat(this.parsePropDocumentation(deeperInterfaceFileContents, deeperInterfaceName));
  }

  /**
   * Helper method for parsePropDocumentation.
   * Uses regex extract an interface from a file contents string
   * @param fileContent 
   * @param interfaceName 
   * @returns The whole block of the interface with this name
   */
  private static extractInterfaceFromFile(fileContent: string, interfaceName: string): string {
    // Make the interface name safe to use in regex
    const escapedInterfaceName = interfaceName.replace(/[-/\\^$.*+?()[\]{}|]/g, "\\$&");

    // Run regex pattern
    const regex = new RegExp(
      `interface\\s+${escapedInterfaceName}(?:\\s+extends\\s+([a-zA-Z0-9_]+(?:\\s*,\\s*[a-zA-Z0-9_]+)*))?\\s*{[^}]*}`,
      "g"
    );
    const matches = fileContent.match(regex);
    
    // Return the match if there was one
    if (matches) {
      return matches[0];
    } else {
      throw new TsDocParseError(`Unable to find the interface ${escapedInterfaceName}`);
    }
  }

  /**
   * Helper method for parsePropDocumentation.
   * Extracts prop information from an interface into `IComponentProp`s
   * @param interfaceText The block of text where the interface is defined. The information to extract is in here
   * @param interfaceName The name of the interface. Used in errors
   * @returns An array of all of the props defined in *this* interface
   */
  private static extractPropsFromInterface(interfaceText: string, interfaceName: string): IComponentProp[] {
    // Extract the members of the interface as well astheir corresponding documentation comments
    // const propDefinitions = interfaceText.match(/(\w+:\s*[\w<>,\s|]+)(?=\s*(;|\n))/g);
    const propDefinitions = interfaceText.match(/(\w+\??:\s*[^;]+?)(?=\s*(;|\n))/g);
    const propDocComments = interfaceText.match(/\*\*([\s\S]*?)\*\//g);
    if (!propDefinitions || !propDocComments) {
      // This is not an error because you can have interfaces like IRemoteTargetAndZone that are only there to extend off of others
      return [];
    }

    // The following loop depends on a specific index in both arrays referring to the same prop
    if (propDefinitions.length != propDocComments.length) {
      throw new TsDocParseError(
        `The number of props and the number of documentation comments in the interface ${interfaceName} do not match`
      );
    }

    // Combine the two collections into an array of prop documentations.
    // The prop definition at an index should correspond to the prop doc comment at the same index
    const props: IComponentProp[] = [];
    for (const [index, propDefinition] of propDefinitions.entries()) {
      // The documentation comment associated with this prop should be at the same index in its array
      const propDocComment = propDocComments[index];

      // Split the prop definition by the *first* colon to get the name and type
      const [unsanitisedPropName, ...rest] = propDefinition.split(":");

      // The prop name may have a "?", which is type information, so remove it
      const propName = unsanitisedPropName.replace("?", "");

      // While we're at it, this same "?" tells us whether or not the prop is required
      const propIsRequired = !unsanitisedPropName.includes("?");

      // The prop type is everything after the colon, so re-combine `rest` into a single string
      const propType = rest.join(":");

      props.push({
        name: propName,
        type: propType,
        required: propIsRequired,
        description: propDocComment,
        // TODO: Handle default value
      });
    }

    return props;
  }

  /**
   * Helper function for parsePropDocumentation.
   * Uses Vite's glob import to check the file contents of every file in the codebase to see if it contains the interface
   * @param interfaceName The interface to look for
   * @returns The file contents as a string, or null if no file was found with a definition of an interface with this name
   */
  private static getTheContentsOfTheFileAnInterfaceIsDefinedIn(interfaceName: string): string | null {
    for (const fileContent of Object.values(modules)) {
      if ((fileContent as string).includes(`export interface ${interfaceName}`)) {
        return fileContent as string;
      }
    }

    return null;
  }
}
