/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TNavConfig, TPageElements, TsDocParseError, TsDocParser } from "..";
import {
  AutoDocPage,
  IComponentDocumentation,
} from "..";


// @ts-ignore - Use Vite's glob import to get all tsx/jsx files as raw strings
const modules = import.meta.glob("../**/*.{tsx,jsx,ts,js}", {
  query: "?raw",
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
 * Generates navigation configuration and page element mappings for all discovered autodoc components.
 *
 * @returns An object containing:
 * - `pageElements`: A {@link TPageElements} mapping from `pageElementReference` to the corresponding React element.
 * - `navConfig`: A {@link TNavConfig} with a single `"Docs"` section containing pages data and order.
 */
export function generateAutoDocNavigation() {
  const autoDocComponents = scanForAutoDocComponents().sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const pageElements: TPageElements = {};
  const pagesData: TNavConfig["data"] = {};
  const pagesOrder: string[] = [];

  for (const component of autoDocComponents) {
    // The display name shown in the navigation
    const displayName = component.name;
    // Used to look up the React element
    const pageElementReference = `autodoc:${component.name}`;
    pageElements[pageElementReference] = <AutoDocPage documentation={component} />;

    pagesData[displayName] = {
      access: "public",
      path: { pageElementReference },
    };

    pagesOrder.push(displayName);
  }

  const navConfig: TNavConfig = {
    data: {
      Docs: {
        access: "public",
        pages: {
          data: pagesData,
          order: pagesOrder,
        },
      },
    },
    order: ["Docs"],
  };

  return { pageElements, navConfig };
}
