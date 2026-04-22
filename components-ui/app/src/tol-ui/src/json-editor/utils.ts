/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { githubDarkTheme, githubLightTheme } from "json-edit-react";

/**
 * Returns the Json Editor theme configuration based on the user's preferred color scheme.
 *
 * In dark mode, this returns the GitHub dark theme with a container background override
 * that matches the ToL background token. In light mode, this returns the GitHub light theme.
 */
export const getJsonEditorTheme = () => {
  const darkModeQuery =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  return darkModeQuery.matches
    ? [
        githubDarkTheme,
        { styles: { container: { backgroundColor: "var(--tol-bg)" } } },
      ]
    : [githubLightTheme];
};
