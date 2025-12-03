/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export interface PMarkdown {
  contents?: string;
  path?: string;
}

export function Markdown({ contents, path }: PMarkdown) {
  const [markdownContent, setMarkdownContent] = useState<string>(contents || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If a path is provided, always prefer it over contents
    if (path) {
      let cancelled = false;
      setLoading(true);
      setError("");

      fetch(path)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch markdown file: ${response.statusText}`);
          }
          return response.text();
        })
        .then((text) => {
          if (!cancelled) {
            setMarkdownContent(text);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message);
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    // If no path, fall back to contents
    if (contents !== undefined) {
      setMarkdownContent(contents);
    }
  }, [path, contents]);

  if (loading) return <div className="markdown-loading">Loading markdown...</div>;
  if (error) return <div className="markdown-error">Error loading markdown: {error}</div>;
  if (!markdownContent) return null;

  return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
}
