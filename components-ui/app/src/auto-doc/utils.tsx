/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page } from "../tol-ui/src";
import { AutoDocPage } from "./AutoDocPage";
import { TSDocParser } from "./TsDocParser";
import { IComponentDocumentation } from "../interfaces";


// Use Vite's glob import to get all tsx/jsx files as raw strings
const modules = import.meta.glob('../tol-ui/src/**/*.{tsx,jsx}', { 
  as: 'raw',
  eager: true 
});

/**
 * Scans all TypeScript files in the tol-ui/src directory for components tagged with @auto-doc
 * @returns Array of component documentation objects
 */
function scanForAutoDocComponents(): IComponentDocumentation[] {
  const components: IComponentDocumentation[] = [];
  
  for (const [path, content] of Object.entries(modules)) {
    if (typeof content === 'string' && content.includes('@auto-doc')) {
      const relativePath = path.replace('../tol-ui/src/', '');
      const documentation = TSDocParser.parseFileContent(content, relativePath);
      
      if (documentation) {
        components.push(documentation);
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
