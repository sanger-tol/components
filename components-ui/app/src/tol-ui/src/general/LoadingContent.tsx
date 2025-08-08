/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader } from "../index";

export interface PLoadingContent {
  text?: string;
}

export function LoadingContent(props: PLoadingContent) {
  const { text } = props;
  return (
    <div className="fixed-full-page">
      <div className="fixed-centered-loader">
        <Loader />
      </div>
      <div className="fixed-centered-text">{text || "Loading..."}</div>
    </div>
  );
}
