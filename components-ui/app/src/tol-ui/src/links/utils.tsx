/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { KNOWN_ICON_PROVIDERS } from "../constants";
import { IDetectedLinkDetails } from "../interfaces";

/**
 * Checks whether a URL matches one of the known social/provider link patterns.
 *
 * @param link - The URL or link target to inspect.
 * @returns True when the URL includes a known provider name such as GitHub or GitLab.
 */
export function isKnownIconLink(link: string): boolean {
  return Object.keys(KNOWN_ICON_PROVIDERS).some((name) =>
    link.toLowerCase().includes(name)
  );
}

/**
 * Extracts the matching provider metadata for a known link URL.
 *
 * @param link - The URL or link target to inspect.
 * @returns The icon name, visible text, and style configuration for the detected provider,
 * or an empty object when the URL does not match a known provider.
 */
export function detectLinkDetails(link: string): IDetectedLinkDetails {
  const provider = Object.keys(KNOWN_ICON_PROVIDERS).find((name) =>
    link.toLowerCase().includes(name)
  );

  return provider
    ? {
        icon: KNOWN_ICON_PROVIDERS[provider].icon,
        text: KNOWN_ICON_PROVIDERS[provider].text,
        config: KNOWN_ICON_PROVIDERS[provider].config ?? "brands",
      }
    : {};
}
