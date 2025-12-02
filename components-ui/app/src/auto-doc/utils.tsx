/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page } from "../tol-ui/src";
import { AutoDocPage } from "./AutoDocPage";

// Use Vite's glob import to get all tsx/jsx files as raw strings
const modules = import.meta.glob('../tol-ui/src/**/*.{tsx,jsx}', { 
  as: 'raw',
  eager: true 
});

function scanForAutoDocComponents(): { name: string; filePath: string }[] {
  const components: { name: string; filePath: string }[] = [];
  
  for (const [path, content] of Object.entries(modules)) {
    if (typeof content === 'string' && content.includes('tol-auto-doc')) {
      const fileName = path.split('/').pop() || '';
      const componentName = fileName.replace(/\.(tsx|jsx)$/, '');
      const relativePath = path.replace('../tol-ui/src/', '');
      
      components.push({
        name: componentName,
        filePath: relativePath
      });
    }
  }
  
  return components;
}

export function generateAutoDocPages(): Page[] {
  const autoDocComponents = scanForAutoDocComponents();
  
  return autoDocComponents.map((component) => ({
    name: `${component.name}`,
    element: <AutoDocPage componentName={component.name} filePath={component.filePath} />,
    hidden: false
  }));
}
