/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page, TsDocParseError, TsDocParser } from "..";
import {
  AutoDocPage,
  IComponentDocumentation,
} from "..";


// @ts-ignore - Use Vite's glob import to get all tsx/jsx files as raw strings
const modules = import.meta.glob("../**/*.{tsx,jsx,ts,js}", { 
  as: "raw",
  eager: true 
});

/**
 * Scans all TypeScript files in the tol-ui/src directory for components tagged with @-autodoc
 * @returns Array of component documentation objects
 */
function scanForAutoDocComponents(): IComponentDocumentation[] {
  const components: IComponentDocumentation[] = [];
  
  for (const [path, content] of Object.entries(modules)) {
    if (typeof content === "string" && content.includes("@autodoc")) {
      const relativePath = path.replace("../", "./");

      try {
        const documentation = TsDocParser.parseFileContent(content, relativePath);
        if (documentation) {
          components.push(documentation);
        }
      } catch (error) {
        if (error instanceof TsDocParseError) {
          console.error(`Could not generate autodocs for component at path ${relativePath}:\n${error.message}`);
        }
      }
    }
  }
  
  return components;
}

/**
 * Generates documentation pages for all auto-documented components
 * @returns Array of Page objects for the navigation system
 */
export function generateAutoDocPages(): Page[] {
  const autoDocComponents = scanForAutoDocComponents();
  
  return autoDocComponents.map((component) => ({
    name: `${component.name}`,
    element: <AutoDocPage documentation={component} />,
    hidden: false
  }));
}