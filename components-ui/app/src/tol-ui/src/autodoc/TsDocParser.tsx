/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  AUTO_DOC_REGEX,
  EXAMPLE_REGEX,
  PROP_REGEX,
  IComponentDocumentation,
  IComponentExample,
  IComponentProp,
} from "..";


/**
 * Parses TSDoc comments tagged with @-autodoc to extract component documentation
 */
export class TSDocParser {
  /**
   * Parses the content of a TypeScript file to extract component documentation
   * @param content - The file content as a string
   * @param filePath - The relative path to the file
   * @returns Component documentation object or null if no @-autodoc tag found
   */
  static parseFileContent(content: string, filePath: string): IComponentDocumentation | null {
    const autoDocMatch = content.match(AUTO_DOC_REGEX);
    if (!autoDocMatch) return null;

    const docComment = autoDocMatch[0];
    const componentName = this.extractComponentName(content, filePath);
    
    if (!componentName) return null;

    return {
      name: componentName,
      filePath,
      description: this.extractDescription(docComment),
      props: this.extractPropsFromTSDoc(content, docComment, componentName),
      examples: this.extractExamples(docComment),
      remarks: this.extractRemarks(docComment)
    };
  }

  /**
   * Extracts the component name from the file content or filename
   * @param content - The file content as a string
   * @param filePath - The relative path to the file
   * @returns The component name or null if not found
   */
  private static extractComponentName(content: string, filePath: string): string | null {
    // Try to find function component declaration
    const functionMatch = content.match(/export\s+function\s+([A-Z][a-zA-Z0-9]*)/);
    if (functionMatch) return functionMatch[1];

    // Try to find const component declaration
    const constMatch = content.match(/export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*[:=]/);
    if (constMatch) return constMatch[1];

    // Fallback to filename
    const fileName = filePath.split('/').pop()?.replace(/\.(tsx|jsx)$/, '');
    return fileName || null;
  }

  /**
   * Extracts the main description from a TSDoc comment
   * @param docComment - The complete TSDoc comment block
   * @returns The description text or undefined if not found
   */
  private static extractDescription(docComment: string): string | undefined {
    // Extract text before any @tags
    const descMatch = docComment.match(/\/\*\*\s*([\s\S]*?)(?=@|$)/);
    if (!descMatch) return undefined;

    return descMatch[1]
      .replace(/\s*\*\s?/g, ' ')
      .trim()
      .replace(/\s+/g, ' ') || undefined;
  }

  /**
   * Extracts and merges prop information from interface definitions and TSDoc comments
   * @param content - The file content as a string
   * @param docComment - The TSDoc comment block
   * @param componentName - The name of the component
   * @returns Array of component props with types and descriptions
   */
  private static extractPropsFromTSDoc(content: string, docComment: string, componentName: string): IComponentProp[] {
    const props: IComponentProp[] = [];
    
    // First, get prop definitions from the interface
    const interfaceProps = this.extractPropsFromInterface(content, componentName);
    
    // Then, get prop documentation from @prop tags
    const propDocs = this.extractPropDocumentation(docComment);
    
    // Merge interface definitions with documentation
    for (const interfaceProp of interfaceProps) {
      const doc = propDocs.get(interfaceProp.name);
      props.push({
        ...interfaceProp,
        description: doc?.description
      });
    }

    return props;
  }

/**
 * Extracts prop definitions from TypeScript interface declarations
 * @param content - The file content as a string
 * @param componentName - The name of the component
 * @returns Array of props with type information from the interface
 */
private static extractPropsFromInterface(content: string, componentName: string): IComponentProp[] {
  const props: IComponentProp[] = [];
  
  // Find interface definition (P prefix for props interfaces)
  const interfaceRegex = new RegExp(`interface\\s+P${componentName}[^{]*\\{([^}]+)\\}`, 's');
  const interfaceMatch = content.match(interfaceRegex);
  
  if (!interfaceMatch) return props;

  const interfaceContent = interfaceMatch[1];
  const propLines = interfaceContent.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of propLines) {
    // Remove inline comments for parsing
    const cleanLine = line.replace(/\/\/.*$/, '').trim();
    const prop = this.parsePropDefinition(cleanLine);
    if (prop) props.push(prop);
  }

  return props;
}

  /**
   * Extracts prop documentation from @prop tags in TSDoc comments
   * Format: @prop propName - Description
   * @param docComment - The TSDoc comment block
   * @returns Map of prop names to their documentation
   */
  private static extractPropDocumentation(docComment: string): Map<string, { description: string }> {
    const propDocs = new Map<string, { description: string }>();
    let match;

    // Reset regex state
    PROP_REGEX.lastIndex = 0;
    
    while ((match = PROP_REGEX.exec(docComment)) !== null) {
      const propName = match[1]?.trim();
      const description = match[2]?.replace(/\s*\*\s?/gm, ' ').trim();
      
      if (propName && description) {
        propDocs.set(propName, { description });
      }
    }

    return propDocs;
  }

  /**
   * Parses a single prop definition line from an interface
   * @param propDef - A single line defining a prop (e.g., "name: string" or "optional?: number")
   * @returns Parsed prop information or null if invalid
   */
  private static parsePropDefinition(propDef: string): IComponentProp | null {
    // Remove semicolon and whitespace
    propDef = propDef.replace(/[;,]$/, '').trim();
    
    // Check for optional properties
    const isOptional = propDef.includes('?:');
    const [namePart, typePart] = propDef.split(isOptional ? '?:' : ':').map(s => s.trim());
    
    if (!namePart || !typePart) return null;

    // Handle default values
    let type = typePart;
    let defaultValue: string | undefined;
    
    if (type.includes('=')) {
      [type, defaultValue] = type.split('=').map(s => s.trim());
    }

    return {
      name: namePart,
      type: type,
      required: !isOptional,
      defaultValue
    };
  }

  /**
   * Extracts code examples from @example tags in TSDoc comments
   * @param docComment - The TSDoc comment block
   * @returns Array of examples with optional titles and code content
   */
  private static extractExamples(docComment: string): IComponentExample[] {
    const examples: IComponentExample[] = [];
    let match;

    // Reset regex state
    EXAMPLE_REGEX.lastIndex = 0;
    
    while ((match = EXAMPLE_REGEX.exec(docComment)) !== null) {
      const title = match[1]?.trim() || undefined;
      const code = match[2]?.replace(/\s*\*\s?/gm, '').trim() || '';
      
      if (code) {
        examples.push({ title, code });
      }
    }

    return examples;
  }

  /**
   * Extracts remarks from @remarks tags in TSDoc comments
   * @param docComment - The TSDoc comment block
   * @returns Array of remark strings or undefined if none found
   */
  private static extractRemarks(docComment: string): string[] | undefined {
    const remarks: string[] = [];
    const remarkMatches = docComment.matchAll(/@remarks?\s+(.*?)(?=@\w+|$)/gs);
    
    for (const match of remarkMatches) {
      const remark = match[1]?.replace(/\s*\*\s?/gm, ' ').trim();
      if (remark) remarks.push(remark);
    }

    return remarks.length > 0 ? remarks : undefined;
  }
}