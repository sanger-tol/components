/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Button,
  PEditableTitle,
  downloadItem
} from "../..";

export interface PImageTab {
  componentId: string,
  title: PEditableTitle | undefined,
  objectType: string
}

export function ImageTab(props: PImageTab) {
  const {
    componentId,
    title,
    objectType
  } = props;

  return (
    <div className="tol-download-modal-body">
      <Button
        type="success"
        text="Download as Image"
        onClick={() => {
          downloadItem(componentId, title?.text || objectType)
        }}
        icon="image"
      />
    </div>
  );
}
