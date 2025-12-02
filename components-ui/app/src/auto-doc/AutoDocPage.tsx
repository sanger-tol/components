/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PAutoDocPage {
  componentName: string;
  filePath: string;
}

export function AutoDocPage(props: PAutoDocPage) {
  const { componentName, filePath } = props;

  return (
    <div style={{ padding: '20px' }}>
      <h1>working</h1>
      <p>Auto-generated documentation for: {componentName}</p>
      <p>File: {filePath}</p>
    </div>
  );
}